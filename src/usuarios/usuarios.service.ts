import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
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
    const user = await this.usuarioRepository.findOne({ where: { email: email }, relations: ['id_empresa'] });
    if (user && (await bcrypt.compare(pass, user.contraseña))) {
      return user;
    }
    return null;
  }

  async findOneWithEmpresa(id: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { id_usuario: id }, relations: ['id_empresa'] });
  }

  /** Returns the user's current token_version, or null when the user does not exist. */
  async getTokenVersion(id: string): Promise<number | null> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: id },
      select: { id_usuario: true, token_version: true },
    });
    return usuario ? usuario.token_version : null;
  }

  /** Invalidates every JWT previously issued to the user. */
  async incrementTokenVersion(id: string): Promise<void> {
    await this.usuarioRepository.increment({ id_usuario: id }, 'token_version', 1);
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
  await this.incrementTokenVersion(usuario.id_usuario);
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
      if (createUsuarioDto.telefono && !this.validarTelefonoEcuador(createUsuarioDto.telefono)) {
        throw new BadRequestException('El teléfono no es válido');
      }
      const { id_empresa, ...rest } = createUsuarioDto;
      let empresa: Empresa | undefined;
      if (id_empresa) {
        empresa = await this.usuarioRepository.manager.findOne<Empresa>('Empresa', { where: { id_empresa } });
        if (!empresa) {
          throw new NotFoundException('Empresa no encontrada');
        }
      }
      const nuevoUsuario = this.usuarioRepository.create({ ...rest, id_empresa: empresa });
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

  async findAll(empresaId: string) {
    const usuarios = await this.usuarioRepository.find({
      where: { id_empresa: { id_empresa: empresaId } },
      relations: ['id_empresa'],
    });
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

  /**
   * @param requesterId id of the authenticated user making the change. The
   * current password is only verified when users change their own password;
   * an admin resetting another user's password is exempt. When omitted the
   * check is enforced (fail-safe).
   */
  async update(id: string, updateUsuarioDto: UpdateUsuarioDto, requesterId?: string) {
    try {
      const usuario = await this.usuarioRepository.findOneBy({ id_usuario: id });
      if (!usuario) throw new NotFoundException('Usuario no encontrado');

      if (updateUsuarioDto.email && !this.validarEmail(updateUsuarioDto.email)) {
        throw new BadRequestException('El email no es válido');
      }

      if (updateUsuarioDto.telefono && !this.validarTelefonoEcuador(updateUsuarioDto.telefono)) {
        throw new BadRequestException('El teléfono no es válido');
      }

      // Preparar datos para actualizar, excluyendo currentPassword
      let updateData: any = { ...updateUsuarioDto };
      delete updateData.currentPassword; // Remover currentPassword de los datos de actualización

      if (updateUsuarioDto.contraseña) {
        const changingOtherUser = requesterId !== undefined && requesterId !== id;
        if (!changingOtherUser) {
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
        }

        // Hashear la nueva contraseña
        updateData.contraseña = await bcrypt.hash(updateUsuarioDto.contraseña, 10);
      }

      if (updateUsuarioDto.id_empresa) {
        const empresa = await this.usuarioRepository.manager.findOne('Empresa', {
          where: { id_empresa: updateUsuarioDto.id_empresa },
        });
        if (!empresa) throw new NotFoundException('Empresa no encontrada');
        updateData.id_empresa = empresa;
      }

      // Realizar la actualización en la base de datos
      await this.usuarioRepository.update(id, updateData);

      // A password change revokes every existing session
      if (updateUsuarioDto.contraseña) {
        await this.incrementTokenVersion(id);
      }

      // Obtener el usuario actualizado para retornarlo (sin la contraseña)
      const usuarioActualizado = await this.usuarioRepository.findOne({ 
        where: { id_usuario: id }, 
        relations: ['id_empresa'] 
      });
      
      const { contraseña, ...rest } = usuarioActualizado;
      return rest;

    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
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
