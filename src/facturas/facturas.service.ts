import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,

    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createFacturaDto: CreateFacturaDto) {
    const cliente = await this.clienteRepository.findOne({
      where: { id_cliente: createFacturaDto.id_cliente },
    });
  
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
  
    const nuevaFactura = this.facturaRepository.create({
      ...createFacturaDto,
      cliente,
    });
  
    return this.facturaRepository.save(nuevaFactura);
  }
  

  findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({ relations: ['cliente'] });
  }

  async findOne(id: string): Promise<Factura> {
    const idFactura = Number(id);
  
    if (isNaN(idFactura)) {
      throw new Error('El id_factura debe ser un número válido');
    }

    const factura = await this.facturaRepository.findOne({
      where: { id_factura: idFactura },
      relations: ['cliente'],
    });
  
    if (!factura) {
      throw new NotFoundException('Factura no encontrada');
    }
  
    return factura;
  }
  
  async update(id: string, updateFacturaDto: UpdateFacturaDto): Promise<Factura> {
    const factura = await this.findOne(id);

    Object.assign(factura, updateFacturaDto);
    return this.facturaRepository.save(factura);
  }

  async remove(id: string): Promise<void> {
    const factura = await this.findOne(id);
    await this.facturaRepository.remove(factura);
  }
}
