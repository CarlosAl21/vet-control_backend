import { Injectable } from '@nestjs/common';
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
      throw new Error('Error al crear el producto');
    }
  }

  findAll() {
    return `This action returns all productos`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} producto`;
  }

  async update(id: string, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  }

  async remove(id: string) {
    return `This action removes a #${id} producto`;
  }
}
