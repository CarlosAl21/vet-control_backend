import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  constructor(@InjectRepository(Producto) private productoRepository: Repository<Producto>) {
    console.log('Servicios de productos inicializados');
  }
  async create(createProductoDto: CreateProductoDto) {
    try {
      const nuevoProducto = this.productoRepository.create(createProductoDto);
      return await this.productoRepository.save(nuevoProducto);
    } catch (error) {
      console.error('Error al crear el producto', error);
      throw new InternalServerErrorException('Error al crear el producto');
    }
  }

  findAll() {
    return this.productoRepository.find({relations: ['id_subcategoria', 'id_empresa']});
  }

  async findOne(id: string) {
    try {
      const producto = await this.productoRepository.findOne({ where: {id_producto:id}, relations: ['id_subcategoria', 'id_empresa'] });
      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }
      return producto;
    } catch (error) {
      console.error('Error al buscar el producto', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el producto');
    }
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
    try {
      const producto = await this.productoRepository.findOne({ where: {id_producto:id} });
      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }
      this.productoRepository.merge(producto, updateProductoDto);
      return await this.productoRepository.save(producto);
    } catch (error) {
      console.error('Error al actualizar el producto', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el producto');
    }
  }

  async remove(id: string) {
    try {
      const producto = await this.productoRepository.findOne({ where: {id_producto:id} });
      if (!producto) {
        throw new NotFoundException('Producto no encontrado');
      }
      return await this.productoRepository.remove(producto);
    } catch (error) {
      console.error('Error al eliminar el producto', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el producto');
    }
  }
}
