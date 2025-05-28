import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

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
        throw new BadRequestException('El email no es válido');
      }
      const existingUser = await this.usuarioRepository.findOne({ where: { email: createUsuarioDto.email } });
      if (existingUser) {
        throw new ConflictException('El email ya está en uso');
      }
      const empresa = await this.usuarioRepository.manager.findOne('Empresa', { where: { id_empresa: createUsuarioDto.id_empresa } });
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      const { id_empresa, ...rest } = createUsuarioDto;
      const usuarioData = { ...rest, id_empresa: empresa };
      const nuevoUsuario = this.usuarioRepository.create(usuarioData);
      return await this.usuarioRepository.save(nuevoUsuario); 
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      // Si ya es una excepción de Nest, relánzala
      if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el usuario');
    }
  }

  async findAll() {
    const usuarios = await this.usuarioRepository.find({relations: ['id_empresa']});
    return usuarios.map(({ contraseña, ...rest}) => rest); // Excluir la contraseña del resultado;
  }

  async findOne(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOne({ where: { id_usuario: id }, relations: ['id_empresa'] });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const { contraseña, ...rest } = usuario;
      return rest; // Excluir la contraseña del resultado;
    } catch (error) {
      console.error('Error al encontrar el usuario:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al encontrar el usuario');
    }
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
      if (updateUsuarioDto.email && !this.validarEmail(updateUsuarioDto.email)) {
        throw new BadRequestException('El email no es válido');
      }
      let updateData: any = { ...updateUsuarioDto };
      if (updateUsuarioDto.id_empresa) {
        const empresa = await this.usuarioRepository.manager.findOne('Empresa', { where: { id_empresa: updateUsuarioDto.id_empresa } });
        if (!empresa) {
          throw new NotFoundException('Empresa no encontrada');
        }
        updateData.id_empresa = empresa;
      }
      this.usuarioRepository.merge(usuario, updateData);
      return this.usuarioRepository.save(usuario);
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async remove(id: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) {
        throw new NotFoundException('Usuario no encontrado');
      }
      await this.usuarioRepository.delete(id);
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el usuario');
    }
  }
}
