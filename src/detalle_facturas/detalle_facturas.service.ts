import { BadRequestException, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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
    if (dto.id_lote?.id_lote) {
      const lote = await this.lotesRepository.findOne({ where: { id_lote: dto.id_lote.id_lote } });
      if (!lote || lote.estado !== 'Disponible') {
        throw new BadRequestException('El producto no está disponible');
      }

      await this.lotesService.descontarStock(dto.id_lote.id_lote, dto.cantidad);
    }

    const detalle = this.detalleRepo.create({
      ...dto,
      id_lote: dto.id_lote?.id_lote ? { id_lote: dto.id_lote.id_lote } as Lote : null,
    });

    return this.detalleRepo.save(detalle);
  }


  findAll() {
    return this.detalleRepo.find({ relations: ['id_factura', 'id_lote'] });
  }

  async findOne(id: string) {
    try {
      const detalle = await this.detalleRepo.findOne({ where: { id_detalle: id }, relations: ['id_factura', 'id_lote'] });
      if (!detalle) {
        throw new NotFoundException('Detalle de factura no encontrado');
      }
      return detalle;
    } catch (error) {
      console.error('Error al buscar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el detalle de factura');
    }
  }

  async update(id: string, dto: UpdateDetalleFacturaDto) {
    try {
      const detalle = await this.detalleRepo.findOne({ where: { id_detalle: id } });
      if (!detalle) {
        throw new NotFoundException('Detalle de factura no encontrado');
      }
      this.detalleRepo.merge(detalle, dto);
      return await this.detalleRepo.save(detalle);
    } catch (error) {
      console.error('Error al actualizar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el detalle de factura');
    }
  }

  async remove(id: string) {
    try {
      const detalle = await this.detalleRepo.findOne({ where: { id_detalle: id } });
      if (!detalle) {
        throw new NotFoundException('Detalle de factura no encontrado');
      }
      return await this.detalleRepo.remove(detalle);
    } catch (error) {
      console.error('Error al eliminar el detalle de factura:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el detalle de factura');
    }
  }
}

