import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClientesService {
  constructor(@InjectRepository(Cliente) private clienteRepository: Repository<Cliente>) {
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

  async create(createClienteDto: CreateClienteDto) {
    try {
      if (!this.validarEmail(createClienteDto.email)) {
        throw new BadRequestException('El email no es válido');
      }
      if (!this.validarTelefonoEcuador(createClienteDto.telefono)) {
        throw new BadRequestException('El teléfono no es válido para Ecuador');
      }
      const nuevoCliente = this.clienteRepository.create(createClienteDto);
      return await this.clienteRepository.save(nuevoCliente); 
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
      const cliente = await this.clienteRepository.findOne({ where: {id_cliente: id}, relations: ['id_empresa'] });
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
      const cliente = await this.clienteRepository.findOneBy({ id_cliente: id });
      if (!cliente) {
        throw new NotFoundException('Cliente no encontrado');
      }
      if (updateClienteDto.email && !this.validarEmail(updateClienteDto.email)) {
        throw new BadRequestException('El email no es válido');
      }
      if (updateClienteDto.telefono && !this.validarTelefonoEcuador(updateClienteDto.telefono)) {
        throw new BadRequestException('El teléfono no es válido para Ecuador');
      }
      this.clienteRepository.merge(cliente, updateClienteDto);
      return await this.clienteRepository.save(cliente);
    } catch (error) {
      console.error('Error al actualizar el cliente:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar el cliente');
    }
  }

  async remove(id: string) {
    try {
      const cliente = await this.clienteRepository.findOneBy({ id_cliente: id });
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
}
