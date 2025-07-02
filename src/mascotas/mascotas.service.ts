import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateMascotaDto } from './dto/create-mascota.dto';
import { UpdateMascotaDto } from './dto/update-mascota.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Mascota } from './entities/mascota.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Injectable()
export class MascotasService {
  constructor(
    @InjectRepository(Mascota) 
    private readonly mascotaRepository: Repository<Mascota>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {
    console.log('Servicios de mascotas inicializados');
  }
  async create(createMascotaDto: CreateMascotaDto) {
    try {
      const nuevaMascota = this.mascotaRepository.create(createMascotaDto);
      return await this.mascotaRepository.save(nuevaMascota);
    } catch (error) {
      console.log('Error al crear la mascota', error);
      throw new InternalServerErrorException('Error al crear la mascota');
    }
  }

  findAll() {
    return this.mascotaRepository.find({relations: ['id_usuario']});
  }

  async findOne(id: string) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }, relations: ['id_usuario']});
      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada');
      }
      return mascota;
    } catch (error) {
      console.log('Error al buscar la mascota', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la mascota');
    }
  }

  async update(id: string, updateMascotaDto: UpdateMascotaDto) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }});
      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada');
      }
      this.mascotaRepository.merge(mascota, updateMascotaDto);
      return await this.mascotaRepository.save(mascota);
    } catch (error) {
      console.log('Error al actualizar la mascota', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la mascota');      
    }
  }

  async remove(id: string) {
    try {
      const mascota = await this.mascotaRepository.findOne({where: { id_mascota: id }});
      if (!mascota) {
        throw new NotFoundException('Mascota no encontrada');
      }
      return await this.mascotaRepository.remove(mascota);
    } catch (error) {
      console.log('Error al eliminar la mascota', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la mascota');      
    }
  }
  
  async findByIdUser(id: string){
    try {
      const user = await this.usuarioRepository.findOne({where: { id_usuario: id }});
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const mascotas = await this.mascotaRepository.find({where: { id_usuario: user }, relations: ['id_usuario']});
      if (mascotas.length === 0) {
        throw new NotFoundException('No se encontraron mascotas para este usuario');
      }
      return mascotas;
    } catch (error) {
      console.log('Error al buscar las mascotas del usuario', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar las mascotas del usuario'+ error.message);
    }
  }
}
