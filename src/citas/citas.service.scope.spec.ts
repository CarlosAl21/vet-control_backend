import { NotFoundException } from '@nestjs/common';
import { FindOperator } from 'typeorm';
import { CitasService } from './citas.service';

// Mirrors TypeORM find options: null/undefined keys are skipped, so only an explicit
// operator (Equal) keeps the clinic filter when the caller has no clinic
function matchesClinic(condition: unknown, empresaId: string) {
  if (condition === null || condition === undefined) return true;
  const nested = (condition as { id_empresa?: unknown }).id_empresa;
  if (!(condition instanceof FindOperator) && (nested === null || nested === undefined)) return true;
  return condition instanceof FindOperator && condition.value === empresaId;
}

// A cita owned by clinic emp-a; the repository mock honours the where clause like the DB would
function buildService() {
  const cita = { id_cita: 'cita-a', motivo: 'Old', id_empresa: { id_empresa: 'emp-a' }, id_usuario: { id_usuario: 'u-1' }, id_mascota: { id_mascota: 'm-1' } };
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([cita]),
  };
  const citaRepository = {
    findOne: jest.fn().mockImplementation(async ({ where }) =>
      where.id_cita === cita.id_cita && matchesClinic(where.id_empresa, cita.id_empresa.id_empresa) ? cita : null,
    ),
    save: jest.fn().mockImplementation(async (entity) => entity),
    remove: jest.fn().mockImplementation(async (entity) => entity),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    manager: { findOne: jest.fn() },
  };
  const service = new CitasService(citaRepository as any, {} as any);
  return { service, citaRepository, queryBuilder, cita };
}

describe('CitasService clinic scope', () => {
  it('findAll filters by the cita own clinic', async () => {
    const { service, queryBuilder } = buildService();

    await service.findAll('emp-a');

    expect(queryBuilder.where).toHaveBeenCalledWith('cita.id_empresa = :empresaId', { empresaId: 'emp-a' });
  });

  it('findOne returns a cita of the caller clinic', async () => {
    const { service, cita } = buildService();

    await expect(service.findOne('cita-a', 'emp-a')).resolves.toBe(cita);
  });

  it('findOne returns 404 for a cita of another clinic', async () => {
    const { service } = buildService();

    await expect(service.findOne('cita-a', 'emp-b')).rejects.toThrow(new NotFoundException('Cita no encontrada'));
  });

  it('update returns 404 for a cita of another clinic and does not save', async () => {
    const { service, citaRepository } = buildService();

    await expect(service.update('cita-a', { motivo: 'Hijack' }, 'emp-b')).rejects.toThrow(new NotFoundException('Cita no encontrada'));
    expect(citaRepository.save).not.toHaveBeenCalled();
  });

  it('remove returns 404 for a cita of another clinic and does not delete', async () => {
    const { service, citaRepository } = buildService();

    await expect(service.remove('cita-a', 'emp-b')).rejects.toThrow(new NotFoundException('Cita no encontrada'));
    expect(citaRepository.remove).not.toHaveBeenCalled();
  });

  describe('caller without a clinic (empresaId null in the JWT)', () => {
    it('findOne returns 404 instead of dropping the clinic filter', async () => {
      const { service } = buildService();

      await expect(service.findOne('cita-a', null as any)).rejects.toThrow(new NotFoundException('Cita no encontrada'));
    });

    it('update returns 404 and does not save', async () => {
      const { service, citaRepository } = buildService();

      await expect(service.update('cita-a', { motivo: 'Hijack' }, null as any)).rejects.toThrow(new NotFoundException('Cita no encontrada'));
      expect(citaRepository.save).not.toHaveBeenCalled();
    });

    it('remove returns 404 and does not delete', async () => {
      const { service, citaRepository } = buildService();

      await expect(service.remove('cita-a', null as any)).rejects.toThrow(new NotFoundException('Cita no encontrada'));
      expect(citaRepository.remove).not.toHaveBeenCalled();
    });

    it('create checks the cliente link with an explicit clinic operator', async () => {
      const { service, citaRepository } = buildService();
      citaRepository.manager.findOne.mockResolvedValueOnce({ id_usuario: 'u-1' }).mockResolvedValueOnce(null);

      await expect(
        service.create({ usuarioId: 'u-1', mascotaId: 'm-1', fecha_hora: new Date(), motivo: 'x', estado: 'Pendiente' } as any, null as any),
      ).rejects.toThrow(new NotFoundException('Usuario no encontrado'));
      const clienteWhere = citaRepository.manager.findOne.mock.calls[1][1].where;
      expect(clienteWhere.id_empresa).toBeInstanceOf(FindOperator);
      expect(clienteWhere.id_empresa.value).toBeNull();
    });
  });

  it('remove deletes a cita of the caller clinic', async () => {
    const { service, citaRepository, cita } = buildService();

    await service.remove('cita-a', 'emp-a');

    expect(citaRepository.remove).toHaveBeenCalledWith(cita);
  });
});
