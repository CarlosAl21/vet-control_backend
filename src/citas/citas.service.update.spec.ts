import { NotFoundException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

function buildService(related: { usuario?: object | null; cliente?: object | null; mascota?: object | null } = {}) {
  const cita = { id_cita: 'cita-1', motivo: 'Old', id_usuario: { id_usuario: 'u-old' }, id_mascota: { id_mascota: 'm-old' } };
  const lookups = {
    usuario: related.usuario ?? null,
    cliente: 'cliente' in related ? related.cliente : { id_cliente: 'c-1' },
    mascota: related.mascota ?? null,
  };
  const citaRepository = {
    findOne: jest.fn().mockResolvedValue(cita),
    save: jest.fn().mockImplementation(async (entity) => entity),
    manager: {
      findOne: jest.fn().mockImplementation(async (entity) => {
        if (entity === Usuario) return lookups.usuario;
        if (entity === Cliente) return lookups.cliente;
        if (entity === Mascota) return lookups.mascota;
        return null;
      }),
    },
  };
  const service = new CitasService(citaRepository as any, {} as any);
  return { service, citaRepository };
}

describe('CitasService.update', () => {
  it('replaces the usuario and mascota relations when their ids are sent', async () => {
    const usuario = { id_usuario: 'u-new' };
    const mascota = { id_mascota: 'm-new' };
    const { service, citaRepository } = buildService({ usuario, mascota });

    const result = await service.update('cita-1', { usuarioId: 'u-new', mascotaId: 'm-new' }, 'emp-1');

    expect(result.id_usuario).toBe(usuario);
    expect(result.id_mascota).toBe(mascota);
    expect(result).not.toHaveProperty('usuarioId');
    expect(result).not.toHaveProperty('mascotaId');
    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Mascota, {
      where: { id_mascota: 'm-new', id_usuario: { id_usuario: 'u-new' } },
    });
  });

  it('keeps existing relations when ids are not sent', async () => {
    const { service, citaRepository } = buildService();

    const result = await service.update('cita-1', { motivo: 'New' }, 'emp-1');

    expect(result.motivo).toBe('New');
    expect(result.id_usuario).toEqual({ id_usuario: 'u-old' });
    expect(result.id_mascota).toEqual({ id_mascota: 'm-old' });
    expect(citaRepository.manager.findOne).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the new mascota does not exist', async () => {
    const { service, citaRepository } = buildService({ mascota: null });

    await expect(service.update('cita-1', { mascotaId: 'missing' }, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('checks a new mascota against the current usuario of the cita', async () => {
    const mascota = { id_mascota: 'm-new' };
    const { service, citaRepository } = buildService({ mascota });

    await service.update('cita-1', { mascotaId: 'm-new' }, 'emp-1');

    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Mascota, {
      where: { id_mascota: 'm-new', id_usuario: { id_usuario: 'u-old' } },
    });
  });

  it('throws NotFoundException when the new usuario is not a cliente of the clinic', async () => {
    const { service, citaRepository } = buildService({ usuario: { id_usuario: 'u-new' }, cliente: null });

    await expect(service.update('cita-1', { usuarioId: 'u-new' }, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the current mascota does not belong to the new usuario', async () => {
    const { service, citaRepository } = buildService({ usuario: { id_usuario: 'u-new' }, mascota: null });

    await expect(service.update('cita-1', { usuarioId: 'u-new' }, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Mascota, {
      where: { id_mascota: 'm-old', id_usuario: { id_usuario: 'u-new' } },
    });
    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
