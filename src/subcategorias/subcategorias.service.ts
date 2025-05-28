import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateSubcategoriaDto } from './dto/create-subcategoria.dto';
import { UpdateSubcategoriaDto } from './dto/update-subcategoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategoria } from './entities/subcategoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubcategoriasService {
  constructor(@InjectRepository(Subcategoria) private subcategoriaRepository: Repository<Subcategoria>) {
    console.log('Servicios de subcategorias inicializados');
  }

  async create(createSubcategoriaDto: CreateSubcategoriaDto) {
    try {
      const subcategoria = this.subcategoriaRepository.create(createSubcategoriaDto);
      return await this.subcategoriaRepository.save(subcategoria);
    } catch (error) {
      console.error('Error al crear la Subcategoria:', error);
      throw new InternalServerErrorException('Error al crear la Subcategoria');
    }
  }

  findAll() {
    return this.subcategoriaRepository.find();
  }

  async findOne(id: string) {
    try {
      const subcategoria = await this.subcategoriaRepository.findOne({ where: { id_subcategoria: id } });
      if (!subcategoria) {
        throw new NotFoundException('Subcategoria no encontrada');
      }
      return subcategoria;
    } catch (error) {
      console.error('Error al encontrar la Subcategoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al encontrar la Subcategoria');
    }
  }

  async update(id: string, updateSubcategoriaDto: UpdateSubcategoriaDto) {
    try {
      const subcategoria = await this.subcategoriaRepository.findOne({ where: { id_subcategoria: id } });
      if (!subcategoria) {
        throw new NotFoundException('Subcategoria no encontrada');
      }
      this.subcategoriaRepository.merge(subcategoria, updateSubcategoriaDto);
      return await this.subcategoriaRepository.save(subcategoria);
    } catch (error) {
      console.error('Error al actualizar la Subcategoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la Subcategoria');
    }
  }

  async remove(id: string) {
    try {
      const subcategoria = await this.subcategoriaRepository.findOne({ where: { id_subcategoria: id } });
      if (!subcategoria) {
        throw new NotFoundException('Subcategoria no encontrada');
      }
      return await this.subcategoriaRepository.remove(subcategoria);
    } catch (error) {
      console.error('Error al eliminar la Subcategoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la Subcategoria');
    }
  }
}
