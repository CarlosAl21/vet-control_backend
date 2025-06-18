import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';

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
      const nuevaCita = this.citaRepository.create(createCitaDto);
      const citaGuardada = await this.citaRepository.save(nuevaCita);

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
      console.error('Error creating cita:', error);
      throw new InternalServerErrorException('Error creating cita');
    }
  }

  findAll() {
    return this.citaRepository.find({ relations: ['id_mascota', 'id_usuario'] });
  }

  async findOne(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id }, relations: ['id_mascota', 'id_usuario'] });
      if (!cita) {
        throw new NotFoundException('Cita not found');
      }
      return cita;
    } catch (error) {
      console.error('Error finding cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error finding cita');
    }
  }

  async update(id: string, updateCitaDto: UpdateCitaDto) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new NotFoundException('Cita not found');
      }
      this.citaRepository.merge(cita, updateCitaDto);
      return await this.citaRepository.save(cita);
    } catch (error) {
      console.error('Error updating cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating cita');
    }
  }

  async remove(id: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: { id_cita: id } });
      if (!cita) {
        throw new NotFoundException('Cita not found');
      }
      return await this.citaRepository.remove(cita);
    } catch (error) {
      console.error('Error removing cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error removing cita');
    }
  }
}
