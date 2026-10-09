import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Recordatorio } from './entities/recordatorio.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecordatoriosService {
  constructor(
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,
    @InjectRepository(Mascota)
    private readonly mascotaRepository: Repository<Mascota>,
  ) {}

  async create(createRecordatorioDto: CreateRecordatorioDto) {
    try {
      const { id_mascota, ...rest } = createRecordatorioDto;
      const mascota = await this.findMascota(id_mascota);
      const recordatorio = this.recordatorioRepository.create({
        ...rest,
        id_mascota: mascota,
      });
      return await this.recordatorioRepository.save(recordatorio);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Error al crear el recordatorio: ${error.message}`);
    }
  }

  findAll() {
    return this.recordatorioRepository.find({
      relations: ['id_mascota'],
    });
  }

  async findOne(id: string) {
    try {
      const recordatorio = await this.recordatorioRepository.findOne({
        where: { id_recordatorio: id },
        relations: ['id_mascota'],
      });
      if (!recordatorio) {
        throw new Error('Recordatorio no encontrado');
      }
      return recordatorio;
    } catch (error) {
      throw new Error(`Error al encontrar el recordatorio: ${error.message}`);
    }
  }

  async update(id: string, updateRecordatorioDto: UpdateRecordatorioDto) {
    try {
      const recordatorio = await this.recordatorioRepository.findOne({
        where: { id_recordatorio: id },
      });
      if (!recordatorio) {
        throw new Error('Recordatorio no encontrado');
      }
      const { id_mascota, ...rest } = updateRecordatorioDto;
      const recordatorioUpdate = this.recordatorioRepository.merge(recordatorio, rest);
      if (id_mascota) {
        recordatorioUpdate.id_mascota = await this.findMascota(id_mascota);
      }
      return await this.recordatorioRepository.save(recordatorioUpdate);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new Error(`Error al actualizar el recordatorio: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const recordatorio = await this.recordatorioRepository.findOne({
        where: { id_recordatorio: id },
      });
      if (!recordatorio) {
        throw new Error('Recordatorio no encontrado');
      }
      await this.recordatorioRepository.remove(recordatorio);
      return { message: 'Recordatorio eliminado correctamente' };
    } catch (error) {
      throw new Error(`Error al eliminar el recordatorio: ${error.message}`);
    }
  }

  async findByMascotaId(id_mascota: string) {
    try {
      const recordatorios = await this.recordatorioRepository.find({
        where: { id_mascota: { id_mascota } },
        relations: ['id_mascota'],
      });
      if (!recordatorios || recordatorios.length === 0) {
        throw new Error('No se encontraron recordatorios para esta mascota');
      }
      return recordatorios;
    } catch (error) {
      throw new Error(`Error al buscar recordatorios por mascota: ${error.message}`);
    }
  }

  private async findMascota(id_mascota: string): Promise<Mascota> {
    const mascota = await this.mascotaRepository.findOne({
      where: { id_mascota },
    });
    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }
    return mascota;
  }
}
