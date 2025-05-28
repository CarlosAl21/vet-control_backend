import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';

@Injectable()
export class EmpresasService {
  constructor(@InjectRepository(Empresa) private readonly empresaRepository: Repository<Empresa>) {
    console.log('Servicios de empresas inicializados');
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      const empresa = this.empresaRepository.create(createEmpresaDto);
      return await this.empresaRepository.save(empresa);
    } catch (error) {
      console.error('Error al crear la empresa:', error);
      throw new InternalServerErrorException('Error al crear la empresa');
    }
  }

  findAll() {
    return this.empresaRepository.find();
  }

  async findOne(id: string) {
    try {
      const empresa = await this.empresaRepository.findOne({ where: { id_empresa: id } });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return empresa;
    } catch (error) {
      console.error('Error al encontrar la empresa:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al encontrar la empresa');
    }
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    try {
      const empresa = await this.empresaRepository.findOne({ where: { id_empresa: id } });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      this.empresaRepository.merge(empresa, updateEmpresaDto);
      return this.empresaRepository.save(empresa);
    } catch (error) {
      console.error('Error al actualizar la empresa:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la empresa');
    }
  }

  async remove(id: string) {
    try {
      const empresa = await this.empresaRepository.findOne({ where: { id_empresa: id } });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      return this.empresaRepository.remove(empresa);
    } catch (error) {
      console.error('Error al eliminar la empresa:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la empresa');
    }
  }
}
