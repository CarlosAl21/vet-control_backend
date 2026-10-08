import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasService {
  constructor(@InjectRepository(Categoria) private readonly categoriaRepository: Repository<Categoria>) {
    console.log('Servicios de categorias inicializados');
  }

  async create(createCategoriaDto: CreateCategoriaDto) {
    try {
      const categoria = this.categoriaRepository.create(createCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      console.error('Error al crear la categoria:', error);
      throw new InternalServerErrorException('Error al crear la categoria');
    }
  }

  findAll() {
    return this.categoriaRepository.find();
  }

  async findOne(id: string) {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) {
        throw new NotFoundException('Categoria no encontrada');
      }
      return categoria;
    } catch (error) {
      console.error('Error al encontrar la categoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al encontrar la categoria');
    }
  }

  async update(id: string, updateCategoriaDto: UpdateCategoriaDto) {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) {
        throw new NotFoundException('Categoria no encontrada');
      }
      this.categoriaRepository.merge(categoria, updateCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      console.error('Error al actualizar la categoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la categoria');
    }
  }

  async remove(id: string) {
    try {
      const categoria = await this.categoriaRepository.findOne({ where: { id_categoria: id } });
      if (!categoria) {
        throw new NotFoundException('Categoria no encontrada');
      }
      return await this.categoriaRepository.remove(categoria);
    } catch (error) {
      console.error('Error al eliminar la categoria:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la categoria');
    }
  }
}
