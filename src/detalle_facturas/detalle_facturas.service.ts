import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DetalleFactura } from './entities/detalle_factura.entity';
import { CreateDetalleFacturaDto } from './dto/create-detalle_factura.dto';
import { UpdateDetalleFacturaDto } from './dto/update-detalle_factura.dto';
import { LotesService } from 'src/lotes/lotes.service';
import { Lote } from 'src/lotes/entities/lote.entity';

@Injectable()
export class DetalleFacturaService {
  constructor(
    @InjectRepository(DetalleFactura)
    private readonly detalleRepo: Repository<DetalleFactura>,
    @InjectRepository(Lote)
    private readonly lotesRepository: Repository<Lote>,
    private readonly lotesService: LotesService, // Asegúrate de que este servicio esté correctamente in
  ) {}

  async create(dto: CreateDetalleFacturaDto) {
    const lote = await this.lotesRepository.findOne({where: {id_lote: dto.id_lote.id_lote}});
    if (lote.estado !== 'Disponible') {
      throw new BadRequestException('El producto no está disponible');
    }

    await this.lotesService.descontarStock(dto.id_lote.id_lote, dto.cantidad);

    const detalle = this.detalleRepo.create(dto);

    return this.detalleRepo.save(detalle);
  }

  findAll() {
    return this.detalleRepo.find({ relations: ['factura'] });
  }

  findOne(id: string) {
    return this.detalleRepo.findOne({ where: { id_detalle: id }, relations: ['factura'] });
  }

  update(id: string, dto: UpdateDetalleFacturaDto) {
    return this.detalleRepo.update(id, dto);
  }

  remove(id: string) {
    return this.detalleRepo.delete(id);
  }
}

