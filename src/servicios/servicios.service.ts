import { Injectable } from '@nestjs/common';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Injectable()
export class ServiciosService {
  constructor(
    @InjectRepository(Servicio)
    private readonly servicioRepository: Repository<Servicio>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
  ){}

  async create(createServicioDto: CreateServicioDto) {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id_empresa: createServicioDto.id_empresa.id_empresa },
      });
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }
      const servicio = this.servicioRepository.create({
        ...createServicioDto,
        id_empresa: empresa,
      });
      return this.servicioRepository.save(servicio);
    } catch (error) {
      throw new Error(`Error creando el servicio: ${error.message}`);
    }
  }

  findAll() {
    return this.servicioRepository.find({
      relations: ['id_empresa'],
    });
  }

  async findOne(id: string) {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { id_servicio: id },
        relations: ['id_empresa'],
      });
      if (!servicio) {
        throw new Error(`Servicio con id ${id} no encontrado`);
      }
      return servicio;
    } catch (error) {
      throw new Error(`Error al encontrar un servicio con el id ${id}: ${error.message}`);
    }
  }

  async update(id: string, updateServicioDto: UpdateServicioDto) {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { id_servicio: id },
        relations: ['id_empresa'],
      });
      if (!servicio) {
        throw new Error(`Servicio con id ${id} no encontrado`);
      }
      const servicioUpdated = this.servicioRepository.merge(servicio, updateServicioDto);
      return this.servicioRepository.save(servicioUpdated);
    } catch (error) {
      throw new Error(`Error actualizando el servicio con id ${id}: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const servicio = await this.servicioRepository.findOne({
        where: { id_servicio: id },
      });
      if (!servicio) {
        throw new Error(`Servicio con id ${id} no encontrado`);
      }
      return this.servicioRepository.remove(servicio);
    } catch (error) {
      throw new Error(`Error eliminando el servicio con id ${id}: ${error.message}`);
    }
  }

  async findByEmpresa(empresaId: string) {
    try {
      const empresa = await this.empresaRepository.findOne({
        where: { id_empresa: empresaId },
      });
      if (!empresa) {
        throw new Error(`Empresa con id ${empresaId} no encontrada`);
      }
      return this.servicioRepository.find({
        where: { id_empresa: empresa },
        relations: ['id_empresa'],
      });
    } catch (error) {
      throw new Error(`Error al encontrar servicios de la empresa con id ${empresaId}: ${error.message}`);
    }
  }

}
