import { Injectable } from '@nestjs/common';
import { CreateDetalleHistorialDto } from './dto/create-detalle_historial.dto';
import { UpdateDetalleHistorialDto } from './dto/update-detalle_historial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleHistorial } from './entities/detalle_historial.entity';
import { Repository } from 'typeorm';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';

@Injectable()
export class DetalleHistorialService {
  constructor(
    @InjectRepository(DetalleHistorial)
    private readonly detalleHistorialRepository: Repository<DetalleHistorial>,
    @InjectRepository(HistorialesMedico)
    private readonly historialRepository: Repository<HistorialesMedico>,
  ) {}

  async create(createDetalleHistorialDto: CreateDetalleHistorialDto) {
    try {
      const historial = await this.historialRepository.findOne({
        where: { id_historial: createDetalleHistorialDto.id_historial.id_historial },
      });
      if (!historial) {
        throw new Error('Historial no encontrado');
      }
      const detalleHistorial = this.detalleHistorialRepository.create({
        ...createDetalleHistorialDto,
        id_historial: historial,
      });
      return await this.detalleHistorialRepository.save(detalleHistorial);
      
    } catch (error) {
      console.error('Error creating detalleHistorial:', error);
      throw new Error('Error al crear el detalle'+ error.message);
    }
  }

  findAll() {
    return this.detalleHistorialRepository.find({
      relations: ['id_historial'],
    });
  }

  async findOne(id: string) {
    try {
      const detalleHistorial = await this.detalleHistorialRepository.findOne({
        where: { id_detalle_historial: id },
        relations: ['id_historial'],
      });
      if (!detalleHistorial) {
        throw new Error('DetalleHistorial not found');
      }
      return detalleHistorial;
    } catch (error) {
      console.error('Error finding detalleHistorial:', error);
      throw new Error('Error al encontrar el detalle con el id: ' + id + ': ' + error.message);
      
    }
  }

  async update(id: string, updateDetalleHistorialDto: UpdateDetalleHistorialDto) {
    try {
      const detalleHistorial = await this.detalleHistorialRepository.findOne({
        where: { id_detalle_historial: id },
        relations: ['id_historial'],
      });
      if (!detalleHistorial) {
        throw new Error('DetalleHistorial not found');
      }
      const detalleUpdated = this.detalleHistorialRepository.merge(detalleHistorial, updateDetalleHistorialDto);
      return await this.detalleHistorialRepository.save(detalleUpdated);
    } catch (error) {
      console.error('Error updating detalleHistorial:', error);
      throw new Error('Error al actualizar el detalle con el id: ' + id + ': ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      const detalleHistorial = await this.detalleHistorialRepository.findOne({
        where: { id_detalle_historial: id },
      });
      if (!detalleHistorial) {
        throw new Error('DetalleHistorial not found');
      }
      return await this.detalleHistorialRepository.remove(detalleHistorial);
    } catch (error) {
      console.error('Error removing detalleHistorial:', error);
      throw new Error('Error al eliminar el detalle con el id: ' + id + ': ' + error.message);
    }
  }
}
