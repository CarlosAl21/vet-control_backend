import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clienteRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private readonly mailService: MailService,
  ) {
    console.log('Servicios del cliente inicializados');
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

  async validateUserExists(email: string) {
    try {
      this.validarEmail(email);
      const usuario = await this.usuarioRepository.findOne({
        where: { email: email },
      });
      if (usuario) {
        return usuario;
      }
      return false;
    } catch (error) {
      console.error('Error al validar el usuario:', error);
      throw new InternalServerErrorException(
        'Error al validar el usuario' + error.message,
      );
    }
  }

  private generarContrasenaTemporal(length = 10): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async create(createClienteDto: CreateClienteDto, email: string) {
    try {
      const usuarioExistente = await this.validateUserExists(
        email,
      );
      if (!usuarioExistente) {
        if (!this.validarEmail(email)) {
          throw new BadRequestException('El email no es válido');
        }

        const tempPassword = this.generarContrasenaTemporal();
        const nuevoUsuario = this.usuarioRepository.create({
          email: email,
          contraseña: tempPassword,
        });

        const usuarioSave = await this.usuarioRepository.save(nuevoUsuario);
        // Enviar correo con la contraseña temporal
        await this.mailService.sendWelcomeWithTempPassword(
          usuarioSave.email,
          {
            contraseña: tempPassword,
          }
        );

        createClienteDto.id_usuario = usuarioSave;
        const nuevoCliente = this.clienteRepository.create(createClienteDto);
        const clienteSave = await this.clienteRepository.save(nuevoCliente);
        return clienteSave;
      }
      if (!this.validarEmail(email)) {
        throw new BadRequestException('El email no es válido');
      }

      createClienteDto.id_usuario = usuarioExistente;
      const nuevoCliente = this.clienteRepository.create(createClienteDto);
      const clienteSave = await this.clienteRepository.save(nuevoCliente);
      return clienteSave;
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear el cliente');
    }
  }

  findAll() {
    return this.clienteRepository.find({ relations: ['id_empresa'] });
  }

  async findOne(id: string) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id_cliente: id },
        relations: ['id_empresa'],
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      console.error('Error al encontrar el cliente:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al encontrar el cliente');
    }
  }

  async update(id: string, updateClienteDto: UpdateClienteDto) {
    try {
      const cliente = await this.clienteRepository.findOneBy({
        id_cliente: id,
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      this.clienteRepository.merge(cliente, updateClienteDto);
      return await this.clienteRepository.save(cliente);
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async remove(id: string) {
    try {
      const cliente = await this.clienteRepository.findOneBy({
        id_cliente: id,
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      return await this.clienteRepository.remove(cliente);
    } catch (error) {
      console.error('Error al eliminar el cliente:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar el cliente');
    }
  }

  async obtenerMascotasPorCliente(id: string) {
    try {
      const cliente = await this.clienteRepository.findOne({
        where: { id_cliente: id },
        relations: ['id_usuario', 'mascotas'],
      });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      return cliente.id_usuario.mascotas;
    } catch (error) {
      console.error('Error al obtener las mascotas del cliente:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al obtener las mascotas del cliente',
      );
    }
  }
}
