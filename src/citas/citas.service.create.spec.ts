import { NotFoundException } from '@nestjs/common';
import { CitasService } from './citas.service';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

const dto = {
  fecha_hora: new Date('2026-10-11T10:00:00Z'),
  motivo: 'Vacuna',
  estado: 'Pendiente',
  usuarioId: 'u-1',
  mascotaId: 'm-1',
};

function buildService(related: { usuario?: object | null; cliente?: object | null; mascota?: object | null } = {}) {
  const lookups = {
    usuario: 'usuario' in related ? related.usuario : { id_usuario: 'u-1' },
    cliente: 'cliente' in related ? related.cliente : { id_cliente: 'c-1' },
    mascota: 'mascota' in related ? related.mascota : { id_mascota: 'm-1' },
  };
  const citaRepository = {
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
  return { service, citaRepository };
}

describe('CitasService.create', () => {
  it('persists the cita with the clinic from the caller', async () => {
    const { service, citaRepository } = buildService();

    const result = await service.create(dto, 'emp-1');

    expect(result.id_empresa).toEqual({ id_empresa: 'emp-1' });
    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Cliente, {
      where: { id_usuario: { id_usuario: 'u-1' }, id_empresa: { id_empresa: 'emp-1' } },
    });
    expect(citaRepository.manager.findOne).toHaveBeenCalledWith(Mascota, {
      where: { id_mascota: 'm-1', id_usuario: { id_usuario: 'u-1' } },
    });
  });

  it('throws NotFoundException when the usuario does not exist', async () => {
    const { service, citaRepository } = buildService({ usuario: null });

    await expect(service.create(dto, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the usuario is not a cliente of the clinic', async () => {
    const { service, citaRepository } = buildService({ cliente: null });

    await expect(service.create(dto, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when the mascota does not belong to the usuario', async () => {
    const { service, citaRepository } = buildService({ mascota: null });

    await expect(service.create(dto, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
    expect(citaRepository.save).not.toHaveBeenCalled();
  });
});
