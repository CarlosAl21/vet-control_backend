import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { MoreThan, Repository } from 'typeorm';
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

  private validarTelefonoEcuador(telefono: string): boolean {
    // Formato para Ecuador:
    // Móviles: empiezan con 09 y tienen 10 dígitos
    // Convencionales: empiezan con 02, 03, 04, etc. y tienen también 9 dígitos
    const telefonoRegex = /^(09\d{8}|0[2-7]\d{7})$/;
    return telefonoRegex.test(telefono);
  }

  async validateUser(email: string, pass: string): Promise<Usuario|any> {
    const user = await this.usuarioRepository.findOne({ where: { email: email} });
    if (user && (await bcrypt.compare(pass, user.contraseña))) {
      return user;
    }
    return null;
  }

  async saveResetToken(email: string, token: string) {
  const usuario = await this.usuarioRepository.findOne({ where: { email } });
  if (!usuario) return false;
  usuario.resetPasswordToken = token;
  usuario.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validez
  await this.usuarioRepository.save(usuario);
  return true;
}

async resetPasswordWithToken(token: string, newPassword: string) {
  const usuario = await this.usuarioRepository.findOne({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: MoreThan(new Date()),
    },
  });
  if (!usuario) return false;
  usuario.contraseña = await bcrypt.hash(newPassword, 10);
  usuario.resetPasswordToken = null;
  usuario.resetPasswordExpires = null;
  await this.usuarioRepository.save(usuario);
  return true;
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
      if(createUsuarioDto.email){
      const empresa = await this.usuarioRepository.manager.findOne('Empresa', { where: { id_empresa: createUsuarioDto.id_empresa.id_empresa } });
      
      if (createUsuarioDto.telefono && !this.validarTelefonoEcuador(createUsuarioDto.telefono)) {
        throw new BadRequestException('El teléfono no es válido');
      }
      if (!empresa) {
        throw new NotFoundException('Empresa no encontrada');
      }
      const { id_empresa, ...rest } = createUsuarioDto;
      const usuarioData = { ...rest, id_empresa: empresa };
      const nuevoUsuario = this.usuarioRepository.create(usuarioData);
      return await this.usuarioRepository.save(nuevoUsuario); 
    }
      const nuevoUsuario = this.usuarioRepository.create(createUsuarioDto);
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
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (updateUsuarioDto.email && !this.validarEmail(updateUsuarioDto.email)) {
      throw new BadRequestException('El email no es válido');
    }

    if (updateUsuarioDto.contraseña) {
    if (!updateUsuarioDto.currentPassword) {
      throw new BadRequestException('La contraseña actual es requerida');
    }

    const isPasswordValid = await bcrypt.compare(
      updateUsuarioDto.currentPassword,
      usuario.contraseña,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Hashear la nueva contraseña
    updateUsuarioDto.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
  }

    let updateData:any = { ...updateUsuarioDto };
    if (updateUsuarioDto.id_empresa) {
      const empresa = await this.usuarioRepository.manager.findOne('Empresa', {
        where: { id_empresa: updateUsuarioDto.id_empresa },
      });
      if (!empresa) throw new NotFoundException('Empresa no encontrada');
      updateData.id_empresa = empresa;
    }
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
