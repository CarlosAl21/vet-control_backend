import { Injectable } from '@nestjs/common';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UpdateInventarioDto } from './dto/update-inventario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventario } from './entities/inventario.entity';

@Injectable()
export class InventarioService {
  constructor(@InjectRepository(Inventario) private inventarioRepository: Repository<Inventario>) {
    console.log('Servicio de inventario inicializado');
  }
  async create(createInventarioDto: CreateInventarioDto) {
    try {
      const inventario = this.inventarioRepository.create(createInventarioDto);
      return await this.inventarioRepository.save(inventario);
    } catch (error) {
      console.error('Error al crear el inventario:', error);
      throw new Error('Error al crear el inventario');
    }
  }

  findAll() {
    return this.inventarioRepository.find();
  }

  async findOne(id: string) {
    try {
      const inventario = await this.inventarioRepository.findOne({ where: { id_producto: id } });
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      return inventario;
    } catch (error) {
      console.error('Error al buscar el inventario:', error);
      throw new Error('Error al buscar el inventario');
    }
  }

  async update(id: string, updateInventarioDto: UpdateInventarioDto) {
    try {
      const inventario = await this.inventarioRepository.findOne({ where: { id_producto: id } });
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      this.inventarioRepository.merge(inventario, updateInventarioDto);
      return await this.inventarioRepository.save(inventario);
    } catch (error) {
      console.error('Error al actualizar el inventario:', error);
      throw new Error('Error al actualizar el inventario');
    }
  }

  async remove(id: string) {
    try {
      const inventario = await this.inventarioRepository.findOne({ where: { id_producto: id } });
      if (!inventario) {
        throw new Error('Inventario no encontrado');
      }
      return await this.inventarioRepository.remove(inventario);
    } catch (error) {
      console.error('Error al eliminar el inventario:', error);
      throw new Error('Error al eliminar el inventario');
    }
  }
}
