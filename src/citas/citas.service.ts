import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita) private readonly citaRepository: Repository<Cita>,
    private readonly mailService: MailService, // Inyecta el servicio de correo
  ) {
    console.log('Servicios de citas inicializados');
  }

  async create(createCitaDto: CreateCitaDto) {
    try {
      // Buscar entidades relacionadas
      const usuario = await this.citaRepository.manager.findOne(Usuario, { where: { id_usuario: createCitaDto.usuarioId } });
      const mascota = await this.citaRepository.manager.findOne(Mascota, { where: { id_mascota: createCitaDto.mascotaId } });

      if (!usuario || !mascota) {
        throw new NotFoundException('Usuario o mascota no encontrados');
      }

      const { usuarioId, mascotaId, estado, ...restDto } = createCitaDto;
      const nuevaCita = this.citaRepository.create({
        ...restDto,
        estado: estado as EstadoCita,
        id_usuario: usuario,
        id_mascota: mascota,
      });
      const citaGuardada = await this.citaRepository.save(nuevaCita) as unknown as Cita;

      // Enviar correo de confirmación al usuario
      if (citaGuardada.id_usuario && citaGuardada.id_usuario.email) {
        await this.mailService.sendReservationConfirmation(
          citaGuardada.id_usuario.email,
          {
            name: `${citaGuardada.id_usuario.nombre} ${citaGuardada.id_usuario.apellido}`,
            reservationId: citaGuardada.id_cita,
          }
        );
      }

      return citaGuardada;
    } catch (error) {
      console.error('Error al crear la cita:', error);
      throw new InternalServerErrorException('Error al crear la cita');
    }
  }

  findAll(empresaId: string) {
    return this.citaRepository.find({
      where: { id_usuario: { id_empresa: { id_empresa: empresaId } } },
      relations: ['id_mascota', 'id_usuario'],
    });
  }

  async findOne(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id }, relations: ['id_mascota', 'id_usuario'] });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }
      return cita;
    } catch (error) {
      console.error('Error al buscar la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al buscar la cita');
    }
  }

  async update(id: string, updateCitaDto: UpdateCitaDto) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }
      Object.assign(cita, updateCitaDto);
      return await this.citaRepository.save(cita);
    } catch (error) {
      console.error('Error al actualizar la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la cita');
    }
  }

  async remove(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }
      return await this.citaRepository.remove(cita);
    } catch (error) {
      console.error('Error al eliminar la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la cita');
    }
  }
}
