import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lote } from './entities/lote.entity';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';

@Injectable()
export class LotesService {
  constructor(
    @InjectRepository(Lote)
    private readonly loteRepository: Repository<Lote>,
  ) {}

  async create(dto: CreateLoteDto): Promise<Lote> {
    try {
      const now = new Date();
      const fechaVencimiento = new Date(dto.fecha_venc);

      const estado = fechaVencimiento < now ? 'No disponible' : 'Disponible';

      const lote = this.loteRepository.create({
        ...dto,
        estado, // fuerza el estado basado en la fecha
      });

      return await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al crear el lote:', error);
      throw new InternalServerErrorException('Error al crear el lote');
    }
  }

  async findAll(): Promise<Lote[]> {
    try {
      return await this.loteRepository.find({ relations: ['id_producto', 'id_proveedor', 'id_empresa'] });
    } catch (error) {
      console.error('Error al obtener los lotes:', error);
      throw new InternalServerErrorException('Error al obtener los lotes');
    }
  }

  async findOne(id: string): Promise<Lote> {
    try {
      const lote = await this.loteRepository.findOne({ where: {id_lote: id}, relations: ['id_producto', 'id_proveedor', 'id_empresa'] });
      if (!lote) throw new NotFoundException('Lote no encontrado');

      const now = new Date();
      const vencido = new Date(lote.fecha_venc) < now;
      const nuevoEstado = vencido ? 'No disponible' : 'Disponible';

      if (lote.estado !== nuevoEstado) {
        lote.estado = nuevoEstado;
        await this.loteRepository.save(lote);
      }
      return lote;
    } catch (error) {
      console.error('Error al buscar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el lote');
    }
  }

  async update(id: string, dto: UpdateLoteDto): Promise<Lote> {
    try {
      const lote = await this.findOne(id);
      Object.assign(lote, dto);
      return await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al actualizar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el lote');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const lote = await this.findOne(id);
      await this.loteRepository.remove(lote);
    } catch (error) {
      console.error('Error al eliminar el lote:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el lote');
    }
  }

  async descontarStock(id_lote: string, cantidad: number): Promise<void> {
    try {
      const lote = await this.loteRepository.findOne({where: { id_lote: id_lote }});
      if (!lote) {
        throw new NotFoundException('Lote no encontrado');
      }
      if (cantidad > lote.stock_actual) {
        throw new BadRequestException('Cantidad solicitada supera el stock disponible');
      }

      lote.stock_actual -= cantidad;
      lote.estado = lote.stock_actual === 0 ? 'No disponible' : 'Disponible';

      await this.loteRepository.save(lote);
    } catch (error) {
      console.error('Error al descontar stock del lote:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al descontar stock del lote');
    }
  }
}
