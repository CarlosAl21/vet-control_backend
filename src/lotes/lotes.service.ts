import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const lote = this.loteRepository.create(dto);
    return this.loteRepository.save(lote);
  }

  async findAll(): Promise<Lote[]> {
    return this.loteRepository.find();
  }

  async findOne(id: number): Promise<Lote> {
    const lote = await this.loteRepository.findOneBy({ id_lote: id });
    if (!lote) throw new NotFoundException('Lote no encontrado');
    return lote;
  }

  async update(id: number, dto: UpdateLoteDto): Promise<Lote> {
    const lote = await this.findOne(id);
    Object.assign(lote, dto);
    return this.loteRepository.save(lote);
  }

  async remove(id: number): Promise<void> {
    const lote = await this.findOne(id);
    await this.loteRepository.remove(lote);
  }

  async descontarStock(id_lote: number, cantidad: number): Promise<void> {
    const lote = await this.findOne(id_lote);

    if (cantidad > lote.stock_actual) {
      throw new BadRequestException('Cantidad solicitada supera el stock disponible');
    }

    lote.stock_actual -= cantidad;

    lote.estado = lote.stock_actual === 0 ? 'No disponible' : 'Disponible';

    await this.loteRepository.save(lote);
  }
}
