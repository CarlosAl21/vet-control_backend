import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateProveedoreDto } from './dto/create-proveedor.dto';
import { UpdateProveedoreDto } from './dto/update-proveedor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proveedor } from './entities/proveedor.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProveedoresService {
  constructor(@InjectRepository(Proveedor) private readonly proveedorRepository: Repository<Proveedor>) {
    console.log('Servicios de proveedores inicializados');
  }

  async create(createProveedoreDto: CreateProveedoreDto) {
    try {
      const nuevoProveedor = this.proveedorRepository.create(createProveedoreDto);
      return await this.proveedorRepository.save(nuevoProveedor);
    } catch (error) {
      console.error('Error al crear el proveedor:', error);
      throw new InternalServerErrorException('Error al crear el proveedor');
    }
  }

  findAll() {
    return this.proveedorRepository.find({ relations: ['id_empresa'] });
  }

  async findOne(id: string) {
    try {
      const proveedor = await this.proveedorRepository.findOne({ where: { id_proveedor: id }, relations: ['id_empresa'] });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }
      return proveedor;
    } catch (error) {
      console.error('Error al buscar el proveedor:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar el proveedor');
    }
  }

  async update(id: string, updateProveedoreDto: UpdateProveedoreDto) {
    try {
      const proveedor = await this.proveedorRepository.findOne({ where: { id_proveedor: id } });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }
      this.proveedorRepository.merge(proveedor, updateProveedoreDto);
      return await this.proveedorRepository.save(proveedor);
    } catch (error) {
      console.error('Error al actualizar el proveedor:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el proveedor');
    }
  }

  async remove(id: string) {
    try {
      const proveedor = await this.proveedorRepository.findOne({ where: { id_proveedor: id } });
      if (!proveedor) {
        throw new NotFoundException('Proveedor no encontrado');
      }
      return await this.proveedorRepository.remove(proveedor);
    } catch (error) {
      console.error('Error al eliminar el proveedor:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el proveedor');
    }
  }
}
