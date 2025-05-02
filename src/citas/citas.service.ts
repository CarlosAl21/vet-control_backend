import { Injectable } from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CitasService {
  constructor(@InjectRepository(Cita) private readonly citaRepository: Repository<Cita>) {
    console.log('Servicios de citas inicializados');
  }

  async create(createCitaDto: CreateCitaDto) {
    try {
      const nuevaCita = this.citaRepository.create(createCitaDto);
      return await this.citaRepository.save(nuevaCita);
    } catch (error) {
      console.error('Error creating cita:', error);
      throw new Error('Error creating cita');
    }
  }

  findAll() {
    return this.citaRepository.find();

  }

  async findOne(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new Error('Cita not found');
      }
      return cita;
    } catch (error) {
      console.error('Error finding cita:', error);
      throw new Error('Error finding cita');
    }
  }

  async update(id: string, updateCitaDto: UpdateCitaDto) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new Error('Cita not found');
      }
      this.citaRepository.merge(cita, updateCitaDto);
      return await this.citaRepository.save(cita);
    } catch (error) {
      console.error('Error updating cita:', error);
      throw new Error('Error updating cita');
    }
  }

  async remove(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new Error('Cita not found');
      }
      return await this.citaRepository.remove(cita);
    } catch (error) {
      console.error('Error removing cita:', error);
      throw new Error('Error removing cita');
    }
  }
}
