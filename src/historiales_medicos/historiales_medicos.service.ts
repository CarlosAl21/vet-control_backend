import { Injectable } from '@nestjs/common';
import { CreateHistorialesMedicoDto } from './dto/create-historiales_medico.dto';
import { UpdateHistorialesMedicoDto } from './dto/update-historiales_medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialesMedico } from './entities/historiales_medico.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistorialesMedicosService {
  constructor(@InjectRepository(HistorialesMedico) private readonly historialesMedicoRepository: Repository<HistorialesMedico>) {
    console.log('Servicios de historiales medicos inicializados');
  }

  async create(createHistorialesMedicoDto: CreateHistorialesMedicoDto) {
    try {
      const nuevoHistorial = this.historialesMedicoRepository.create(createHistorialesMedicoDto);
      return await this.historialesMedicoRepository.save(nuevoHistorial);
    } catch (error) {
      console.error('Error al crear el historial medico:', error);
      throw new Error('Error al crear el historial medico');
    }
  }

  findAll() {
    return this.historialesMedicoRepository.find();
  }

  async findOne(id: string) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id } });
      if (!historialMedico) {
        throw new Error('Historial medico no encontrado');
      }
      return historialMedico;
    } catch (error) {
      console.error('Error al buscar el historial medico:', error);
      throw new Error('Error al buscar el historial medico');
    }
  }

  async update(id: string, updateHistorialesMedicoDto: UpdateHistorialesMedicoDto) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id } });
      if (!historialMedico) {
        throw new Error('Historial medico no encontrado');
      }
      this.historialesMedicoRepository.merge(historialMedico, updateHistorialesMedicoDto);
      return await this.historialesMedicoRepository.save(historialMedico);
    } catch (error) {
      console.error('Error al actualizar el historial medico:', error);
      throw new Error('Error al actualizar el historial medico');
    }
  }

  async remove(id: string) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id } });
      if (!historialMedico) {
        throw new Error('Historial medico no encontrado');
      }
      return await this.historialesMedicoRepository.remove(historialMedico);
    } catch (error) {
      console.error('Error al eliminar el historial medico:', error);
      throw new Error('Error al eliminar el historial medico');
    }
  }
}
