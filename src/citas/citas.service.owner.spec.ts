import { NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { CitasService } from './citas.service';

function buildService(found: { citas?: object[]; cita?: object | null } = {}) {
  const citaRepository = {
    find: jest.fn().mockResolvedValue(found.citas ?? []),
    findOne: jest.fn().mockResolvedValue('cita' in found ? found.cita : null),
  };
  const mailService = { sendReservationConfirmation: jest.fn() };
  const service = new CitasService(citaRepository as any, mailService as any);
  return { service, citaRepository };
}

describe('CitasService owner reads', () => {
  describe('findAllForOwner', () => {
    it('filters citas by the caller usuario with Equal', async () => {
      const citas = [{ id_cita: 'cita-1' }];
      const { service, citaRepository } = buildService({ citas });

      const result = await service.findAllForOwner('u-1');

      expect(result).toBe(citas);
      expect(citaRepository.find).toHaveBeenCalledWith({
        where: { id_usuario: { id_usuario: Equal('u-1') } },
        relations: ['id_mascota', 'id_empresa'],
        order: { fecha_hora: 'DESC' },
      });
    });

    it('keeps the filter when the userId is missing', async () => {
      const { service, citaRepository } = buildService();

      await service.findAllForOwner(undefined as unknown as string);

      expect(citaRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_usuario: { id_usuario: Equal(undefined) } } }),
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
        where: { id_cita: 'cita-1', id_usuario: { id_usuario: Equal('u-1') } },
        relations: ['id_mascota', 'id_empresa'],
      });
    });

    it('throws NotFoundException when the cita is missing or owned by someone else', async () => {
      const { service } = buildService({ cita: null });

      await expect(service.findOneForOwner('cita-2', 'u-1')).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
