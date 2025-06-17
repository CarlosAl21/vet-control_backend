import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateHistorialesMedicoDto } from './dto/create-historiales_medico.dto';
import { UpdateHistorialesMedicoDto } from './dto/update-historiales_medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialesMedico } from './entities/historiales_medico.entity';
import { Repository } from 'typeorm';
import { FotosHistorial } from 'src/fotos_historial/entities/fotos_historial.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as Multer from 'multer';

@Injectable()
export class HistorialesMedicosService {
  constructor(
    @InjectRepository(HistorialesMedico)
    private readonly historialesMedicoRepository: Repository<HistorialesMedico>,
    @InjectRepository(FotosHistorial)
    private readonly fotosHistorialRepository: Repository<FotosHistorial>,
    private readonly cloudinaryService: CloudinaryService,
  ) {
    console.log('Servicios de historiales medicos inicializados');
  }
  async create(createHistorialesMedicoDto: CreateHistorialesMedicoDto, files?: Array<Multer.File>) {
    try {
      const nuevoHistorial = this.historialesMedicoRepository.create(createHistorialesMedicoDto);
      const historialGuardado = await this.historialesMedicoRepository.save(nuevoHistorial);

      // Si hay archivos, subirlos a Cloudinary y crear los registros de fotos
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => this.cloudinaryService.upload(file));
        const uploadResults = await Promise.all(uploadPromises);

        const fotosPromises = uploadResults.map(result =>
          this.fotosHistorialRepository.save({
            url: result.secure_url,
            public_id: result.public_id,
            historial: historialGuardado, // Relación con el historial médico
          })
        );
        await Promise.all(fotosPromises);
      }

      return historialGuardado;
    } catch (error) {
      console.error('Error al crear el historial medico:', error);
      throw new InternalServerErrorException('Error al crear el historial medico');
    }
  }

  findAll() {
    return this.historialesMedicoRepository.find({relations: ['id_mascota']});
  }

  async findOne(id: string) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id }, relations: ['id_mascota'] });
      if (!historialMedico) {
        throw new NotFoundException('Historial medico no encontrado');
      }
      return historialMedico;
    } catch (error) {
      console.error('Error al buscar el historial medico:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el historial medico');
    }
  }

  async update(id: string, updateHistorialesMedicoDto: UpdateHistorialesMedicoDto) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id } });
      if (!historialMedico) {
        throw new NotFoundException('Historial medico no encontrado');
      }
      this.historialesMedicoRepository.merge(historialMedico, updateHistorialesMedicoDto);
      return await this.historialesMedicoRepository.save(historialMedico);
    } catch (error) {
      console.error('Error al actualizar el historial medico:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el historial medico');
    }
  }

  async remove(id: string) {
    try {
      const historialMedico = await this.historialesMedicoRepository.findOne({ where: { id_historial: id } });
      if (!historialMedico) {
        throw new NotFoundException('Historial medico no encontrado');
      }
      return await this.historialesMedicoRepository.remove(historialMedico);
    } catch (error) {
      console.error('Error al eliminar el historial medico:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el historial medico');
    }
  }
}
