import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleFactura } from './entities/detalle_factura.entity';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';
import { LotesService } from 'src/lotes/lotes.service';

@Injectable()
export class DetalleFacturaService {
  constructor(
    @InjectRepository(DetalleFactura)
    private readonly detalleRepo: Repository<DetalleFactura>,
    private readonly lotesService: LotesService,
  ) {}

  async create(dto: CreateDetalleFacturaDto) {
    const lote = await this.lotesService.findOne(dto.id_lote);
    if (lote.estado !== 'Disponible') {
      throw new BadRequestException('El producto no está disponible');
    }

    await this.lotesService.descontarStock(dto.id_lote, dto.cantidad);

    const detalle = this.detalleRepo.create({
      descripcion: dto.descripcion,
      cantidad: dto.cantidad,
      precio_unitario: dto.precio_unitario,
      subtotal: dto.subtotal,
      lote: { id_lote: dto.id_lote },       // relación ManyToOne, solo asignas el id
      factura: { id_factura: dto.id_factura } // igual para factura
    });

    return this.detalleRepo.save(detalle);
  }

  findAll() {
    return this.detalleRepo.find({ relations: ['factura'] });
  }

  findOne(id: number) {
    return this.detalleRepo.findOne({ where: { id_detalle: id }, relations: ['factura'] });
  }

  update(id: number, dto: UpdateDetalleFacturaDto) {
    return this.detalleRepo.update(id, dto);
  }

  remove(id: number) {
    return this.detalleRepo.delete(id);
  }
}

