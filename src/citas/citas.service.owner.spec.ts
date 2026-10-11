import { NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { CitasService } from './citas.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

type Found = {
  citas?: object[];
  cita?: object | null;
  usuario?: object | null;
  cliente?: object | null;
  mascota?: object | null;
};

function buildService(found: Found = {}) {
  const lookups = {
    usuario: 'usuario' in found ? found.usuario : { id_usuario: 'u-1', email: 'owner@mail.test', nombre: 'Ana', apellido: 'Paz' },
    cliente: 'cliente' in found ? found.cliente : { id_cliente: 'c-1' },
    mascota: 'mascota' in found ? found.mascota : { id_mascota: 'm-1' },
  };
  const citaRepository = {
    find: jest.fn().mockResolvedValue(found.citas ?? []),
    findOne: jest.fn().mockResolvedValue('cita' in found ? found.cita : null),
    create: jest.fn().mockImplementation((data) => data),
    save: jest.fn().mockImplementation(async (entity) => ({ id_cita: 'cita-1', ...entity })),
    manager: {
      findOne: jest.fn().mockImplementation(async (entity) => {
        if (entity === Usuario) return lookups.usuario;
        if (entity === Cliente) return lookups.cliente;
        if (entity === Mascota) return lookups.mascota;
        return null;
      }),
    },
  };
  const mailService = { sendReservationConfirmation: jest.fn() };
  const service = new CitasService(citaRepository as any, mailService as any);
  return { service, citaRepository, mailService };
}

describe('CitasService owner reads', () => {
  describe('findAllForOwner', () => {
    it('filters citas by the caller usuario with Equal', async () => {
      const citas = [{ id_cita: 'cita-1' }];
      const { service, citaRepository } = buildService({ citas });

      const result = await service.findAllForOwner('u-1');

      expect(result).toBe(citas);
      expect(citaRepository.find).toHaveBeenCalledWith({
        where: { id_usuario: Equal('u-1') },
        relations: ['id_mascota', 'id_empresa'],
        order: { fecha_hora: 'DESC' },
      });
    });

    it('keeps the filter when the userId is missing', async () => {
      const { service, citaRepository } = buildService();

      await service.findAllForOwner(undefined as unknown as string);

      expect(citaRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_usuario: Equal(undefined) } }),
      );
    });
  });

  describe('findOneForOwner', () => {
    it('returns the cita when it belongs to the caller', async () => {
      const cita = { id_cita: 'cita-1' };
      const { service, citaRepository } = buildService({ cita });

      const result = await service.findOneForOwner('cita-1', 'u-1');

      expect(result).toBe(cita);
      expect(citaRepository.findOne).toHaveBeenCalledWith({
        where: { id_cita: 'cita-1', id_usuario: Equal('u-1') },
        relations: ['id_mascota', 'id_empresa'],
      });
    });

    it('throws NotFoundException when the cita is missing or owned by someone else', async () => {
      const { service } = buildService({ cita: null });

      await expect(service.findOneForOwner('cita-2', 'u-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});

describe('CitasService.createForOwner', () => {
  const dto = {
    fecha_hora: new Date('2026-10-12T10:00:00Z'),
    motivo: 'Vacuna',
    mascotaId: 'm-1',
    empresaId: 'emp-1',
  };

  it('books the cita for the caller at the validated clinic and sends the confirmation', async () => {
    const { service, citaRepository, mailService } = buildService();

    const result = await service.createForOwner(dto, 'u-1');

    expect(citaRepository.create).toHaveBeenCalledWith({
      fecha_hora: dto.fecha_hora,
      motivo: 'Vacuna',
      id_usuario: expect.objectContaining({ id_usuario: 'u-1' }),
      id_mascota: { id_mascota: 'm-1' },
      id_empresa: { id_empresa: 'emp-1' },
    });
    expect(result.id_empresa).toEqual({ id_empresa: 'emp-1' });
    expect(result).not.toHaveProperty('estado');
    expect(mailService.sendReservationConfirmation).toHaveBeenCalledWith('owner@mail.test', {
      name: 'Ana Paz',
      reservationId: 'cita-1',
    });
  });

  it('ignores usuario, estado and clinic smuggled in the body', async () => {
    const { service, citaRepository } = buildService();
    const body = { ...dto, usuarioId: 'u-2', estado: 'Completada', id_empresa: 'emp-2' } as any;

    await service.createForOwner(body, 'u-1');

    const created = citaRepository.create.mock.calls[0][0];
    expect(created.id_usuario).toEqual(expect.objectContaining({ id_usuario: 'u-1' }));
    expect(created.id_empresa).toEqual({ id_empresa: 'emp-1' });
    expect(created).not.toHaveProperty('usuarioId');
    expect(created).not.toHaveProperty('estado');
  });

  it('scopes the cliente and mascota lookups to the caller', async () => {
    const { service, citaRepository } = buildService();

    await service.createForOwner(dto, 'u-1');

    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Cliente, {
      where: { id_usuario: Equal('u-1'), id_empresa: Equal('emp-1') },
    });
    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Mascota, {
      where: { id_mascota: 'm-1', id_usuario: Equal('u-1') },
    });
  });

  it('throws NotFoundException when the mascota belongs to someone else', async () => {
    const { service, citaRepository, mailService } = buildService({ mascota: null });

    await expect(service.createForOwner(dto, 'u-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
    expect(mailService.sendReservationConfirmation).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the caller is not a cliente of the clinic', async () => {
    const { service, citaRepository } = buildService({ cliente: null });

    await expect(service.createForOwner(dto, 'u-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException without any lookup when the caller id is missing', async () => {
    const { service, citaRepository } = buildService();

    await expect(service.createForOwner(dto, undefined as unknown as string)).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.manager.findOne).not.toHaveBeenCalled();
    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
