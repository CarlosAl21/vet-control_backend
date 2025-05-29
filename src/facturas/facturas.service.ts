import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,

    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {}



  async create(createFacturaDto: CreateFacturaDto) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id_cliente: createFacturaDto.id_cliente.id_cliente },
      });

      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }

      const nuevaFactura = this.facturaRepository.create({
        ...createFacturaDto,
        id_cliente: cliente,
      });

      return await this.facturaRepository.save(nuevaFactura);
    } catch (error) {
      console.error('Error al crear la factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la factura');
    }
  }

  findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({ relations: ['cliente', 'id_detalle_factura'] });
  }

  async findOne(id: string): Promise<Factura> {
    try {
      const idFactura = Number(id);

      if (isNaN(idFactura)) {
        throw new BadRequestException('El id_factura debe ser un número válido');
      }

      const factura = await this.facturaRepository.findOne({
        where: { id_factura: idFactura },
        relations: ['id_cliente', 'id_empresa'],
      });

      if (!factura) {
        throw new NotFoundException('Factura no encontrada');
      }

      return factura;
    } catch (error) {
      console.error('Error al buscar la factura:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la factura');
    }
  }

  async update(id: string, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
    try {
      const factura = await this.findOne(id);
      Object.assign(factura, updateFacturaDto);
      return await this.facturaRepository.save(factura);
    } catch (error) {
      console.error('Error al actualizar la factura:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la factura');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const factura = await this.findOne(id);
      await this.facturaRepository.remove(factura);
    } catch (error) {
      console.error('Error al eliminar la factura:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la factura');
    }
  }

  async findByEmpresa(id_empresa: string) {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id_empresa: id_empresa }})
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return await this.facturaRepository.find({
        where: { id_empresa: empresa } });
      
    } catch (error) {
      console.error('Error al buscar facturas por empresa:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar facturas por empresa');
    }
  }

}
