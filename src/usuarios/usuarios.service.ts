import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,){
    console.log('Servicio de usuarios inicializado');
  }

  private validarEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async validateUser(email: string, pass: string): Promise<Usuario|any> {
    const user = await this.usuarioRepository.findOne({ where: { email: email} });
    if (user && (await bcrypt.compare(pass, user.contraseña))) {
      return user;
    }
    return null;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    console.log('Creando usuario:', createUsuarioDto);
    try {
      if (!this.validarEmail(createUsuarioDto.email)) {
        throw new Error('El email no es válido');
      }
      const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
      if (existingUser) {
        throw new Error('El email ya está en uso');
      }
      const empresa = await this.usuarioRepository.manager.findOne('Empresa', { where: { id_empresa: createUsuarioDto.id_empresa } });
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }
      createUsuarioDto.id_empresa = empresa; // Asignar la entidad Empresa al DTO
      const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
      return await this.usuarioRepository.save(nuevoUsuario); 
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      throw new Error('Error al crear el usuario');
    }
  }

  findAll() {
    return this.usuarioRepository.find();
  }

  async findOne(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      console.error('Error al encontrar el usuario:', error);
      throw new Error('Error al encontrar el usuario');
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      if (updateUsuarioDto.email && !this.validarEmail(updateUsuarioDto.email)) {
        throw new Error('El email no es válido');
      }
      this.usuarioRepository.merge(usuario, updateUsuarioDto);
      return this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      throw new Error('Error al actualizar el usuario');
    }
  }

  async remove(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) {
        throw new Error('Usuario no encontrado');
      }
      await this.usuarioRepository.delete(id);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      throw new Error('Error al eliminar el usuario');
      
    }
  }
}
