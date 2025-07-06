import { Injectable } from '@nestjs/common';
import { CreateDetalleHistorialDto } from './dto/create-detalle_historial.dto';
import { UpdateDetalleHistorialDto } from './dto/update-detalle_historial.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DetalleHistorial } from './entities/detalle_historial.entity';
import { Repository } from 'typeorm';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class DetalleHistorialService {
  constructor(
    @InjectRepository(DetalleHistorial)
    private readonly detalleHistorialRepository: Repository<DetalleHistorial>,
    @InjectRepository(HistorialesMedico)
    private readonly historialRepository: Repository<HistorialesMedico>,
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createDetalleHistorialDto: CreateDetalleHistorialDto) {
    try {
      const historial = await this.historialRepository.findOne({
        where: { id_historial: createDetalleHistorialDto.id_historial.id_historial },
      });
      if (!historial) {
        throw new Error('Historial no encontrado');
      }
      createDetalleHistorialDto.id_historial = historial;

      const servicio = await this.servicioRepository.findOne({
        where: { id_servicio: createDetalleHistorialDto.id_servicio.id_servicio },
      });
      if (!servicio) {
        throw new Error('Servicio no encontrado');
      }
      createDetalleHistorialDto.id_servicio = servicio;

      const veterinario = await this.usuarioRepository.findOne({
        where: { id_usuario: createDetalleHistorialDto.id_veterinario.id_usuario },
      });
      if (!veterinario) {
        throw new Error('Veterinario no encontrado');
      }
      createDetalleHistorialDto.id_veterinario = veterinario;

      const detalleHistorial = this.detalleHistorialRepository.create(createDetalleHistorialDto);
      
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

  async findByHistorialId(historialId: string) {
    try {
      const historial = await this.historialRepository.findOne({
        where: { id_historial: historialId },
      });
      if (!historial) {
        throw new Error('Historial not found');
      }
      const detalles = await this.detalleHistorialRepository
        .createQueryBuilder('detalle')
        .leftJoinAndSelect('detalle.id_historial', 'historial')
        .leftJoinAndSelect('detalle.id_servicio', 'servicio')
        .leftJoinAndSelect('detalle.id_veterinario', 'veterinario')
        .where('historial.id_historial = :historialId', { historialId })
        .getMany();
      
      if (!detalles || detalles.length === 0) {
        throw new Error('No detalles found for the given historialId');
      } 
      return detalles;
    } catch (error) {
      console.error('Error finding detalles by historialId:', error);
      throw new Error('Error al encontrar los detalles del historial con el id: ' + historialId + ': ' + error.message);
    }
  }
}
