import { Requester, userAccess } from 'src/auth/user-access';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Equal, In, MoreThan, Repository } from 'typeorm';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MailService } from 'src/mail/mail.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { LotesService } from 'src/lotes/lotes.service';
import { EstadoLote, Lote } from 'src/lotes/entities/lote.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';
import { CreateFacturaConDetallesDto } from './dto/create-factura-con-detalles.dto';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly mailService: MailService, // Inyecta el servicio de correo
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly lotesService: LotesService,
  ) {}

  async create(createFacturaDto: CreateFacturaDto, empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
    }

    // The tenant always comes from the JWT; any body id_empresa is discarded.
    const { id_cliente, ...rest } = createFacturaDto as CreateFacturaDto & { id_empresa?: unknown };
    delete (rest as { id_empresa?: unknown }).id_empresa;
    const cliente = await this.findCliente(id_cliente, empresaId);

    // Usa el valor en minúsculas 'pendiente' para estado por defecto
    const estado = createFacturaDto.estado || 'pendiente';

    const nuevaFactura = this.facturaRepository.create({
      ...rest,
      cliente, // Aquí va cliente, no id_cliente
      estado,
      id_empresa: { id_empresa: empresaId },
    });

    return this.facturaRepository.save(nuevaFactura);
  }

  /**
   * Factura, detalles and lote stock commit together: any failing detalle (lote of another
   * clinic, unavailable, short on stock) rolls back everything, including earlier decrements.
   * Subtotals and total are computed here; the client never supplies them.
   */
  async createWithDetalles(dto: CreateFacturaConDetallesDto, empresaId: string | null) {
    if (!empresaId) {
      throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
    }

    const { id_cliente, detalles, ...rest } = dto as CreateFacturaConDetallesDto & { id_empresa?: unknown };
    delete (rest as { id_empresa?: unknown }).id_empresa;
    const cliente = await this.findCliente(id_cliente, empresaId);

    const round2 = (n: number) => Math.round(n * 100) / 100;

    return this.facturaRepository.manager.transaction(async (manager) => {
      // A line with id_producto may split into several records (one per lote), so the total is
      // summed over the records actually saved. Lines run in order: stock taken by one line is
      // already decremented (same transaction) when the next one picks its lotes.
      const registros: { descripcion: string; cantidad: number; precio_unitario: number; subtotal: number; id_lote: string | null }[] = [];
      for (const { id_lote, id_producto, ...linea } of detalles) {
        for (const toma of await this.tomarStock(manager, empresaId, linea.cantidad, id_lote, id_producto)) {
          registros.push({
            descripcion: linea.descripcion,
            precio_unitario: linea.precio_unitario,
            cantidad: toma.cantidad,
            subtotal: round2(toma.cantidad * linea.precio_unitario),
            id_lote: toma.id_lote,
          });
        }
      }
      const total = round2(registros.reduce((sum, r) => sum + r.subtotal, 0));

      const factura = await manager.save(
        manager.create(Factura, {
          ...rest,
          total,
          cliente,
          estado: dto.estado || 'pendiente',
          id_empresa: { id_empresa: empresaId },
        }),
      );

      const guardados: DetalleFactura[] = [];
      for (const { id_lote, ...registro } of registros) {
        guardados.push(
          await manager.save(
            manager.create(DetalleFactura, {
              ...registro,
              id_factura: { id_factura: factura.id_factura } as Factura,
              id_lote: id_lote ? ({ id_lote } as Lote) : null,
            }),
          ),
        );
      }

      factura.detalles = guardados;
      return factura;
    });
  }

  /**
   * Takes `cantidad` units of stock for one line and returns what was taken per lote
   * (a single `null` lote for a free/service line).
   * - id_lote: that lote only (it must belong to id_producto when both are given).
   * - id_producto alone: FEFO over the clinic's active, unexpired lotes with stock.
   */
  private async tomarStock(
    manager: EntityManager,
    empresaId: string,
    cantidad: number,
    id_lote?: string,
    id_producto?: string,
  ): Promise<{ id_lote: string | null; cantidad: number }[]> {
    if (id_lote) {
      if (id_producto) {
        const lote = await manager.findOne(Lote, {
          where: { id_lote: Equal(id_lote), id_empresa: Equal(empresaId) },
          relations: ['id_producto'],
        });
        // A missing lote falls through to descontarStock, which answers 404.
        if (lote && lote.id_producto?.id_producto !== id_producto) {
          throw new BadRequestException('El lote no pertenece al producto');
        }
      }
      // Checks the lote belongs to the clinic, is available and has stock, inside this transaction.
      await this.lotesService.descontarStock(id_lote, cantidad, empresaId, manager);
      return [{ id_lote, cantidad }];
    }
    if (!id_producto) {
      return [{ id_lote: null, cantidad }];
    }

    const producto = await manager.findOne(Producto, {
      where: { id_producto: Equal(id_producto), id_empresa: Equal(empresaId) },
    });
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }

    // The row lock keeps a concurrent sale from taking these units between the read and the
    // guarded UPDATE in descontarStock. Expiry uses the same rule as descontarStock.
    const lotes = (
      await manager.find(Lote, {
        where: {
          id_producto: Equal(id_producto),
          id_empresa: Equal(empresaId),
          estado: EstadoLote.ACTIVO,
          stock_actual: MoreThan(0),
        },
        order: { fecha_venc: 'ASC', fecha_entrada: 'ASC' },
        lock: { mode: 'pessimistic_write' },
      })
    ).filter((lote) => new Date(lote.fecha_venc) >= new Date());
    if (lotes.length === 0) {
      throw new BadRequestException('El producto no está disponible');
    }

    const tomas: { id_lote: string; cantidad: number }[] = [];
    let pendiente = cantidad;
    for (const lote of lotes) {
      if (pendiente === 0) break;
      const toma = Math.min(pendiente, lote.stock_actual);
      tomas.push({ id_lote: lote.id_lote, cantidad: toma });
      pendiente -= toma;
    }
    if (pendiente > 0) {
      throw new BadRequestException('Cantidad solicitada supera el stock disponible');
    }
    for (const toma of tomas) {
      await this.lotesService.descontarStock(toma.id_lote, toma.cantidad, empresaId, manager);
    }
    return tomas;
  }

  findAll(empresaId: string): Promise<Factura[]> {
    return this.facturaRepository.find({
      where: { id_empresa: Equal(empresaId) },
      relations: ['cliente', 'cliente.id_usuario', 'detalles'],
    });
  }

  async findOne(
    id: string | number,
    empresaId: string | null,
    relations: string[] = ['cliente', 'id_empresa'],
  ): Promise<Factura> {
    try {
      const idFactura = Number(id);

      if (isNaN(idFactura)) {
        throw new BadRequestException(
          'El id_factura debe ser un número válido',
        );
      }

      // Equal() keeps the tenant filter even when empresaId is null (no rows -> 404).
      const factura = await this.facturaRepository.findOne({
        where: { id_factura: idFactura, id_empresa: Equal(empresaId) },
        relations,
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      return factura;
    } catch (error) {
      console.error('Error al buscar la factura:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la factura');
    }
  }

  async update(
    id: number,
    updateFacturaDto: UpdateFacturaDto,
    empresaId: string | null,
  ): Promise<Factura> {
    // cliente.id_usuario is needed for the payment confirmation email.
    const factura = await this.findOne(id, empresaId, ['cliente', 'cliente.id_usuario', 'id_empresa']);

    const { id_cliente, ...rest } = updateFacturaDto as UpdateFacturaDto & { id_empresa?: unknown };
    delete (rest as { id_empresa?: unknown }).id_empresa;
    if (id_cliente) {
      factura.cliente = await this.findCliente(id_cliente, empresaId as string);
    }
    const facturaUpdate = this.facturaRepository.merge(factura, rest);
    return this.saveAndNotify(facturaUpdate);
  }

  /**
   * System-only path for payment providers (Stripe webhook): there is no user,
   * so it is not scoped to a clinic and must never be exposed through a controller.
   * Returns null when the factura does not exist so the webhook does not fail.
   */
  async markPaid(id: number, metodoPago?: string): Promise<Factura | null> {
    const factura = await this.facturaRepository.findOne({
      where: { id_factura: id },
      relations: ['cliente', 'cliente.id_usuario', 'id_empresa'],
    });
    if (!factura) {
      console.error(`markPaid: factura ${id} no encontrada`);
      return null;
    }

    factura.estado = 'pagado';
    if (metodoPago) {
      factura.metodo_pago = metodoPago;
    }
    return this.saveAndNotify(factura);
  }

  async remove(id: string, empresaId: string | null): Promise<void> {
    const factura = await this.findOne(id, empresaId);
    await this.facturaRepository.remove(factura);
  }

  async findByEmpresa(id_empresa: string, empresaId: string | null): Promise<Factura[]> {
    // The route keeps its URL param for the web front, but only the caller's clinic is served.
    if (!empresaId || id_empresa !== empresaId) {
      throw new NotFoundException('Empresa no encontrada');
    }
    return this.facturaRepository.find({
      where: { id_empresa: Equal(empresaId) },
    });
  }

  async findByUserId(id_usuario: string, requester: Requester) {
    try {
      const access = userAccess(requester, id_usuario);
      if (!access) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const user = await this.usuarioRepository.findOne({
        where: { id_usuario }, relations: ['clientes']
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const clientes = user.clientes;
      if (!clientes || clientes.length === 0) {
        throw new NotFoundException('No se encontraron clientes asociados al usuario');
      }
      const clienteIds = clientes.map(cliente => cliente.id_cliente);
      const facturas = await this.facturaRepository.find({
        where: {
          cliente: { id_cliente: In(clienteIds) },
          // Staff only see the facturas of their own clinic; the owner sees every clinic's.
          ...(access === 'staff' ? { id_empresa: Equal(requester.empresaId) } : {}),
        },
        relations: ['cliente', 'id_empresa', 'detalles'],
      });
      if (facturas.length === 0) {
        throw new NotFoundException('No se encontraron facturas para el usuario');
      }
      return facturas;
    } catch (error) {
      console.error('Error al buscar las facturas por usuario:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar las facturas por usuario');
    }
  }
    

  private async saveAndNotify(factura: Factura): Promise<Factura> {
    const facturaGuardada = await this.facturaRepository.save(factura);

    // Si el estado es "pagado", enviar correo de confirmación al cliente
    if (facturaGuardada.estado === 'pagado' && facturaGuardada.cliente?.id_usuario?.email) {
      await this.mailService.sendPaymentConfirmation(
        facturaGuardada.cliente.id_usuario.email,
        {
          name: `${facturaGuardada.cliente.id_usuario.nombre} ${facturaGuardada.cliente.id_usuario.apellido}`,
          amount: facturaGuardada.total,
          paymentId: facturaGuardada.id_factura,
        }
      );
    }

    return facturaGuardada;
  }

  private async findCliente(id_cliente: string, empresaId: string): Promise<Cliente> {
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: Equal(id_cliente), id_empresa: Equal(empresaId) },
    });
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }
}
