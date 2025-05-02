import { Injectable } from '@nestjs/common';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mascota } from './entities/mascota.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MascotasService {
  constructor(@InjectRepository(Mascota) private readonly mascotaRepository: Repository<Mascota>) {
    console.log('Servicios de mascotas inicializados');
  }
  async create(createMascotaDto: CreateMascotaDto) {
    try {
      const nuevaMascota = this.mascotaRepository.create(createMascotaDto);
      return await this.mascotaRepository.save(nuevaMascota);
    } catch (error) {
      console.log('Error al crear la mascota', error);
      throw new Error('Error al crear la mascota');
    }
  }

  findAll() {
    return this.mascotaRepository.find();
  }

  async findOne(id: string) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }});
      if (!mascota) {
        throw new Error('Mascota no encontrada');
      }
      return mascota;
    } catch (error) {
      console.log('Error al buscar la mascota', error);
      throw new Error('Error al buscar la mascota');
    }
  }

  async update(id: string, updateMascotaDto: UpdateMascotaDto) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }});
      if (!mascota) {
        throw new Error('Mascota no encontrada');
      }
      this.mascotaRepository.merge(mascota, updateMascotaDto);
      return await this.mascotaRepository.save(mascota);
    } catch (error) {
      console.log('Error al actualizar la mascota', error);
      throw new Error('Error al actualizar la mascota');      
    }
  }

  async remove(id: string) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }});
      if (!mascota) {
        throw new Error('Mascota no encontrada');
      }
      return await this.mascotaRepository.remove(mascota);
    } catch (error) {
      console.log('Error al eliminar la mascota', error);
      throw new Error('Error al eliminar la mascota');      
    }
  }
}
