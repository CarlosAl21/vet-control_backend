import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateHistorialesMedicoDto } from './dto/create-historiales_medico.dto';
import { UpdateHistorialesMedicoDto } from './dto/update-historiales_medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HistorialesMedico } from './entities/historiales_medico.entity';
import { Repository } from 'typeorm';
import { FotosHistorial } from 'src/fotos_historial/entities/fotos_historial.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import * as Multer from 'multer';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Injectable()
export class HistorialesMedicosService {
  constructor(
    @InjectRepository(HistorialesMedico)
    private readonly historialesMedicoRepository: Repository<HistorialesMedico>,
    @InjectRepository(FotosHistorial)
    private readonly fotosHistorialRepository: Repository<FotosHistorial>,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(Mascota)
    private readonly mascotaRepository: Repository<Mascota>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ) {
    console.log('Servicios de historiales medicos inicializados');
  }
  async create(createHistorialesMedicoDto: CreateHistorialesMedicoDto, files?: Array<Multer.File>) {
    try {
      const mascota = await this.mascotaRepository.findOne({ where: { id_mascota: createHistorialesMedicoDto.id_mascota.id_mascota } });
      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada');
      }
      // Asignar la mascota al DTO
      createHistorialesMedicoDto.id_mascota = mascota;

      // Verificar si la empresa existe
      const empresa = await this.empresaRepository.findOne({ where: { id_empresa: createHistorialesMedicoDto.id_empresa.id_empresa } });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      // Asignar la empresa al DTO
      createHistorialesMedicoDto.id_empresa = empresa;

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

  async FindByMascotaId(mascotaId: string) {
    try {
      const mascota = await this.mascotaRepository.findOne({ where: { id_mascota: mascotaId } });
      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada');
      }
      const historiales = await this.historialesMedicoRepository.find({
        where: { id_mascota: mascota }, relations: ['fotos_historial', 'detalle_historial'],
      });
      if (historiales.length === 0) {
        throw new NotFoundException('No se encontraron historiales para esta mascota');
      }
      return historiales;
    } catch (error) {
      console.error('Error al buscar historiales por ID de mascota:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar historiales por ID de mascota');
    }
  }
}
