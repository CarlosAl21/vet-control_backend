import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Repository } from 'typeorm';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MailService } from 'src/mail/mail.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

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

  async findByUserId(id_usuario: string) {
    try {
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
        where: { cliente: { id_cliente: In(clienteIds) } },
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
