import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateFirmanteDto } from './dto/create-firmante.dto';
import { UpdateFirmanteDto } from './dto/update-firmante.dto';
import { Firmante } from './entities/firmante.entity';

export interface FirmanteRequester {
  empresaId?: string | null;
}

@Injectable()
export class FirmantesService {
  constructor(
    @InjectRepository(Firmante) private readonly firmanteRepository: Repository<Firmante>,
  ) {}

  async findAll(user: FirmanteRequester) {
    const empresaId = this.requireEmpresa(user);
    return this.firmanteRepository.find({
      where: { id_empresa: { id_empresa: empresaId } },
      order: { orden: 'ASC' },
    });
  }

  async create(createFirmanteDto: CreateFirmanteDto, user: FirmanteRequester) {
    const empresaId = this.requireEmpresa(user);
    const { nombre, puesto, orden } = createFirmanteDto;
    const firmante = this.firmanteRepository.create({
      nombre,
      puesto,
      orden,
      id_empresa: { id_empresa: empresaId },
    });
    return this.firmanteRepository.save(firmante);
  }

  async update(id: string, updateFirmanteDto: UpdateFirmanteDto, user: FirmanteRequester) {
    const firmante = await this.findOwned(id, user);
    const { nombre, puesto, orden } = updateFirmanteDto;
    this.firmanteRepository.merge(firmante, { nombre, puesto, orden });
    return this.firmanteRepository.save(firmante);
  }

  async remove(id: string, user: FirmanteRequester) {
    const firmante = await this.findOwned(id, user);
    return this.firmanteRepository.remove(firmante);
  }

  private async findOwned(id: string, user: FirmanteRequester) {
    const empresaId = this.requireEmpresa(user);
    const firmante = await this.firmanteRepository.findOne({
      where: { id_firmante: id, id_empresa: { id_empresa: empresaId } },
    });
    if (!firmante) {
      throw new NotFoundException('Firmante no encontrado');
    }
    return firmante;
  }

  private requireEmpresa(user: FirmanteRequester): string {
    if (!user?.empresaId) {
      throw new ForbiddenException('El usuario no pertenece a ninguna empresa');
    }
    return user.empresaId;
  }
}
