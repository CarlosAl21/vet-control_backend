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
    const now = new Date();
    const fechaVencimiento = new Date(dto.fecha_venc);

    const estado = fechaVencimiento < now ? 'No disponible' : 'Disponible';

    const lote = this.loteRepository.create({
      ...dto,
      estado, // fuerza el estado basado en la fecha
    });

    return this.loteRepository.save(lote);
  }


  async findAll(): Promise<Lote[]> {
    return this.loteRepository.find();
  }

async findOne(id: string): Promise<Lote> {
  const lote = await this.loteRepository.findOneBy({ id_lote: id });
  if (!lote) throw new NotFoundException('Lote no encontrado');

  const now = new Date();
  const vencido = new Date(lote.fecha_venc) < now;
  const nuevoEstado = vencido ? 'No disponible' : 'Disponible';

  if (lote.estado !== nuevoEstado) {
    lote.estado = nuevoEstado;
    await this.loteRepository.save(lote);
  }
  return lote;
}

  async update(id: string, dto: UpdateLoteDto): Promise<Lote> {
    const lote = await this.findOne(id);
    Object.assign(lote, dto);
    return this.loteRepository.save(lote);
  }

  async remove(id: string): Promise<void> {
    const lote = await this.findOne(id);
    await this.loteRepository.remove(lote);
  }

  async descontarStock(id_lote: string, cantidad: number): Promise<void> {
    const lote = await this.loteRepository.findOne({where: { id_lote: id_lote }});

    if (cantidad > lote.stock_actual) {
      throw new BadRequestException('Cantidad solicitada supera el stock disponible');
    }

    lote.stock_actual -= cantidad;

    lote.estado = lote.stock_actual === 0 ? 'No disponible' : 'Disponible';

    await this.loteRepository.save(lote);
  }
}
