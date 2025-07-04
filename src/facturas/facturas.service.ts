import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import e from 'express';
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

  async create(createFacturaDto: CreateFacturaDto) {
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: createFacturaDto.id_cliente.id_cliente },
    });

    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    // Usa el valor en minúsculas 'pendiente' para estado por defecto
    const estado = createFacturaDto.estado || 'pendiente';

    const nuevaFactura = this.facturaRepository.create({
      ...createFacturaDto,
      cliente, // Aquí va cliente, no id_cliente
      estado,
    });

    return this.facturaRepository.save(nuevaFactura);
  }

  findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: ['cliente', 'id_detalle_factura', 'id_usuario'],
    });
  }

  async findOne(id: string): Promise<Factura> {
    try {
      const idFactura = Number(id);

      if (isNaN(idFactura)) {
        throw new BadRequestException(
          'El id_factura debe ser un número válido',
        );
      }

      const factura = await this.facturaRepository.findOne({
        where: { id_factura: idFactura },
        relations: ['cliente', 'id_empresa'],
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

  async update(id: number, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: { id_factura: id },
      relations: ['cliente', 'cliente.id_usuario', 'id_empresa'],
    });

    if (updateFacturaDto.estado) {
      factura.estado = updateFacturaDto.estado;
    }

    const facturaUpdate = this.facturaRepository.merge(factura, updateFacturaDto);
    const facturaGuardada = await this.facturaRepository.save(facturaUpdate);
    console.log("Factura actualizada", facturaGuardada);
    console.log("Cliente con usuario:", facturaGuardada.cliente);

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

  async remove(id: string): Promise<void> {
    const factura = await this.findOne(id);
    await this.facturaRepository.remove(factura);
  }

  async findByEmpresa(id_empresa: string) {
    const empresaEntity = await this.empresaRepository.findOne({
      where: { id_empresa },
      relations: ['facturas'], // Asegúrate de que la relación esté definida en la entidad Empresa
    });
    return empresaEntity.facturas; // Retorna las facturas asociadas a la empresa
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
    
}
