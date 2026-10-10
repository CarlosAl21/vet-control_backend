import { NotFoundException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

function buildService(related: { usuario?: object | null; mascota?: object | null } = {}) {
  const cita = { id_cita: 'cita-1', motivo: 'Old', id_usuario: { id_usuario: 'u-old' }, id_mascota: { id_mascota: 'm-old' } };
  const citaRepository = {
    findOne: jest.fn().mockResolvedValue(cita),
    save: jest.fn().mockImplementation(async (entity) => entity),
    manager: {
      findOne: jest.fn().mockImplementation(async (entity) =>
        entity === Usuario ? related.usuario ?? null : entity === Mascota ? related.mascota ?? null : null,
      ),
    },
  };
  const service = new CitasService(citaRepository as any, {} as any);
  return { service, citaRepository };
}

describe('CitasService.update', () => {
  it('replaces the usuario and mascota relations when their ids are sent', async () => {
    const usuario = { id_usuario: 'u-new' };
    const mascota = { id_mascota: 'm-new' };
    const { service } = buildService({ usuario, mascota });

    const result = await service.update('cita-1', { usuarioId: 'u-new', mascotaId: 'm-new' });

    expect(result.id_usuario).toBe(usuario);
    expect(result.id_mascota).toBe(mascota);
    expect(result).not.toHaveProperty('usuarioId');
    expect(result).not.toHaveProperty('mascotaId');
  });

  it('keeps existing relations when ids are not sent', async () => {
    const { service, citaRepository } = buildService();

    const result = await service.update('cita-1', { motivo: 'New' });

    expect(result.motivo).toBe('New');
    expect(result.id_usuario).toEqual({ id_usuario: 'u-old' });
    expect(result.id_mascota).toEqual({ id_mascota: 'm-old' });
    expect(citaRepository.manager.findOne).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the new mascota does not exist', async () => {
    const { service, citaRepository } = buildService({ mascota: null });

    await expect(service.update('cita-1', { mascotaId: 'missing' })).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
