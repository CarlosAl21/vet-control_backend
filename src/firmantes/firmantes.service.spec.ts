import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FirmantesService } from './firmantes.service';
import { Firmante } from './entities/firmante.entity';

describe('FirmantesService', () => {
  let service: FirmantesService;
  const repo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((data) => ({ ...data })),
    merge: jest.fn((entity, data) => Object.assign(entity, data)),
    save: jest.fn(async (entity) => ({ id_firmante: 'f-1', ...entity })),
    remove: jest.fn(async (entity) => entity),
  };

  const user = { userId: 'u-1', username: 'admin', rol: 'admin', empresaId: 'emp-1' };
  const noCompanyUser = { ...user, empresaId: null };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirmantesService,
        { provide: getRepositoryToken(Firmante), useValue: repo },
      ],
    }).compile();

    service = module.get<FirmantesService>(FirmantesService);
  });

  describe('findAll', () => {
    it('returns only the caller company signers ordered by orden ASC', async () => {
      repo.find.mockResolvedValue([]);

      await service.findAll(user);

      expect(repo.find).toHaveBeenCalledWith({
        where: { id_empresa: { id_empresa: 'emp-1' } },
        order: { orden: 'ASC' },
      });
    });

    it('rejects a user without company', async () => {
      await expect(service.findAll(noCompanyUser)).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.find).not.toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('assigns the company from the JWT, ignoring any body company', async () => {
      const body = {
        nombre: 'Dra. Ana',
        puesto: 'Directora',
        orden: 1,
        id_empresa: { id_empresa: 'other-company' },
      } as any;

      const result = await service.create(body, user);

      expect(repo.create).toHaveBeenCalledWith({
        nombre: 'Dra. Ana',
        puesto: 'Directora',
        orden: 1,
        id_empresa: { id_empresa: 'emp-1' },
      });
      expect(result.id_empresa).toEqual({ id_empresa: 'emp-1' });
    });

    it('rejects a user without company', async () => {
      await expect(
        service.create({ nombre: 'A', puesto: 'B', orden: 0 }, noCompanyUser),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('looks up the signer by id and caller company', async () => {
      const existing = { id_firmante: 'f-1', nombre: 'A', puesto: 'B', orden: 0 };
      repo.findOne.mockResolvedValue(existing);

      const result = await service.update('f-1', { orden: 3 }, user);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id_firmante: 'f-1', id_empresa: { id_empresa: 'emp-1' } },
      });
      expect(result.orden).toBe(3);
    });

    it('throws NotFoundException for a signer of another company', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.update('f-2', { orden: 3 }, user)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('rejects a user without company', async () => {
      await expect(service.update('f-1', {}, noCompanyUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('removes a signer of the caller company', async () => {
      const existing = { id_firmante: 'f-1' };
      repo.findOne.mockResolvedValue(existing);

      await service.remove('f-1', user);

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id_firmante: 'f-1', id_empresa: { id_empresa: 'emp-1' } },
      });
      expect(repo.remove).toHaveBeenCalledWith(existing);
    });

    it('throws NotFoundException for a signer of another company', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.remove('f-2', user)).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('rejects a user without company', async () => {
      await expect(service.remove('f-1', noCompanyUser)).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });
});
