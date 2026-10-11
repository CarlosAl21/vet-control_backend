import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CreateOwnerCitaDto } from './dto/create-owner-cita.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cita, EstadoCita } from './entities/cita.entity';
import { Equal, Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita) private readonly citaRepository: Repository<Cita>,
    private readonly mailService: MailService, // Inyecta el servicio de correo
  ) {
    console.log('Servicios de citas inicializados');
  }

  async create(createCitaDto: CreateCitaDto, empresaId: string) {
    try {
      // Related entities must belong to the caller's clinic
      const usuario = await this.findClienteUsuario(createCitaDto.usuarioId, empresaId);
      const mascota = await this.findMascotaOfUsuario(createCitaDto.mascotaId, usuario.id_usuario);

      const { usuarioId, mascotaId, estado, ...restDto } = createCitaDto;
      const nuevaCita = this.citaRepository.create({
        ...restDto,
        estado: estado as EstadoCita,
        id_usuario: usuario,
        id_mascota: mascota,
        id_empresa: { id_empresa: empresaId } as Empresa,
      });
      const citaGuardada = await this.citaRepository.save(nuevaCita) as unknown as Cita;
      await this.sendReservationConfirmation(citaGuardada);
      return citaGuardada;
    } catch (error) {
      console.error('Error al crear la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la cita');
    }
  }

  // Owner booking: usuario is the caller, the clinic must have the caller as cliente,
  // and the mascota must belong to the caller. Every failure is a 404 (no existence oracle).
  async createForOwner(createOwnerCitaDto: CreateOwnerCitaDto, userId: string) {
    try {
      if (!userId) {
        throw new NotFoundException('Usuario no encontrado');
      }
      const { fecha_hora, motivo, mascotaId, empresaId } = createOwnerCitaDto;
      const usuario = await this.findClienteUsuario(userId, empresaId);
      const mascota = await this.findMascotaOfUsuario(mascotaId, usuario.id_usuario);

      // Estado is forced to Pendiente by the entity @BeforeInsert hook
      const nuevaCita = this.citaRepository.create({
        fecha_hora,
        motivo,
        id_usuario: usuario,
        id_mascota: mascota,
        id_empresa: { id_empresa: empresaId } as Empresa,
      });
      const citaGuardada = await this.citaRepository.save(nuevaCita) as unknown as Cita;
      await this.sendReservationConfirmation(citaGuardada);
      return citaGuardada;
    } catch (error) {
      console.error('Error al crear la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al crear la cita');
    }
  }

  findAll(empresaId: string) {
    return this.citaRepository
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.id_mascota', 'mascota')
      .leftJoinAndSelect('cita.id_usuario', 'usuario')
      .where('cita.id_empresa = :empresaId', { empresaId })
      .getMany();
  }

  async findOne(id: string, empresaId: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: this.scopedWhere(id, empresaId), relations: ['id_mascota', 'id_usuario'] });
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

  // Owner reads: only citas booked for the caller. The usuario relation is the caller itself, so it is not loaded.
  findAllForOwner(userId: string) {
    return this.citaRepository.find({
      where: this.ownerWhere(userId),
      relations: ['id_mascota', 'id_empresa'],
      order: { fecha_hora: 'DESC' },
    });
  }

  async findOneForOwner(id: string, userId: string) {
    const cita = await this.citaRepository.findOne({
      where: { id_cita: id, ...this.ownerWhere(userId) },
      relations: ['id_mascota', 'id_empresa'],
    });
    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }
    return cita;
  }

  async update(id: string, updateCitaDto: UpdateCitaDto, empresaId: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: this.scopedWhere(id, empresaId), relations: ['id_usuario', 'id_mascota'] });
      if (!cita) {
        throw new NotFoundException('Cita no encontrada');
      }

      const { usuarioId, mascotaId, estado, ...restDto } = updateCitaDto;

      if (usuarioId) {
        cita.id_usuario = await this.findClienteUsuario(usuarioId, empresaId);
      }

      if (usuarioId || mascotaId) {
        // The resulting mascota must belong to the resulting usuario
        const targetMascotaId = mascotaId ?? cita.id_mascota?.id_mascota;
        cita.id_mascota = await this.findMascotaOfUsuario(targetMascotaId, cita.id_usuario?.id_usuario);
      }

      Object.assign(cita, restDto);
      if (estado) {
        cita.estado = estado as EstadoCita;
      }
      return await this.citaRepository.save(cita);
    } catch (error) {
      console.error('Error al actualizar la cita:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la cita');
    }
  }

  async remove(id: string, empresaId: string) {
    try {
      const cita = await this.citaRepository.findOne({ where: this.scopedWhere(id, empresaId) });
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

  // Citas of other clinics are indistinguishable from missing ones (404).
  // Equal() keeps the filter when empresaId is null; plain null keys are skipped by TypeORM.
  private scopedWhere(id: string, empresaId: string) {
    return { id_cita: id, id_empresa: Equal(empresaId) };
  }

  // Enviar correo de confirmación al usuario
  private async sendReservationConfirmation(cita: Cita) {
    if (cita.id_usuario && cita.id_usuario.email) {
      await this.mailService.sendReservationConfirmation(
        cita.id_usuario.email,
        {
          name: `${cita.id_usuario.nombre} ${cita.id_usuario.apellido}`,
          reservationId: cita.id_cita,
        }
      );
    }
  }

  // Citas of other usuarios are indistinguishable from missing ones (404).
  // Equal() keeps the filter even if userId is missing.
  // Relations are filtered flat (id_usuario: Equal(id)): the nested form { id_usuario: { id_usuario } }
  // fails in Postgres because the relation property shares its name with the FK column.
  private ownerWhere(userId: string) {
    return { id_usuario: Equal(userId) };
  }

  // Usuario must exist and be a cliente of the given clinic
  private async findClienteUsuario(usuarioId: string, empresaId: string): Promise<Usuario> {
    const usuario = await this.citaRepository.manager.findOne(Usuario, { where: { id_usuario: usuarioId } });
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    const cliente = await this.citaRepository.manager.findOne(Cliente, {
      where: { id_usuario: Equal(usuarioId), id_empresa: Equal(empresaId) },
    });
    if (!cliente) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return usuario;
  }

  // Mascota must exist and belong to the given usuario
  private async findMascotaOfUsuario(mascotaId: string | undefined, usuarioId: string | undefined): Promise<Mascota> {
    const mascota = mascotaId && usuarioId
      ? await this.citaRepository.manager.findOne(Mascota, {
          where: { id_mascota: mascotaId, id_usuario: Equal(usuarioId) },
        })
      : null;
    if (!mascota) {
      throw new NotFoundException('Mascota no encontrada');
    }
    return mascota;
  }
}
