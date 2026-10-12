import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { LotesService } from './lotes.service';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn(async (data) => data),
  remove: jest.fn(async () => undefined),
  manager: { findOne: jest.fn() },
});

const baseDto = () => ({
  codigo_lote: 'LT-1',
  fecha_entrada: new Date('2026-01-01'),
  fecha_venc: new Date('2099-01-01'),
  stock_actual: 10,
  estado: 'activo',
  id_producto: { id_producto: 'prod-1' },
  id_proveedor: { id_proveedor: 'prov-1' },
});

const ownedLote = () => ({
  id_lote: 'lote-1',
  fecha_venc: new Date('2099-01-01'),
  estado: 'activo',
  id_empresa: { id_empresa: 'emp-1' },
});

// Resolves producto/proveedor lookups only when they belong to emp-1.
const sameClinicManager = (repo: ReturnType<typeof mockRepo>, foreign?: 'producto' | 'proveedor') => {
  repo.manager.findOne.mockImplementation(async (entity: unknown) => {
    if (entity === Producto) return foreign === 'producto' ? null : { id_producto: 'prod-1' };
    if (entity === Proveedor) return foreign === 'proveedor' ? null : { id_proveedor: 'prov-1' };
    return null;
  });
};

describe('LotesService clinic scope', () => {
  describe('create', () => {
    it('uses the JWT empresa and ignores a body id_empresa', async () => {
      const repo = mockRepo();
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      await service.create({ ...baseDto(), id_empresa: { id_empresa: 'emp-other' } } as any, 'emp-1');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_empresa: { id_empresa: 'emp-1' } }),
      );
      expect(repo.save).toHaveBeenCalled();
    });

    it('scopes producto and proveedor lookups to the JWT empresa', async () => {
      const repo = mockRepo();
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      await service.create(baseDto() as any, 'emp-1');

      expect(repo.manager.findOne).toHaveBeenCalledWith(Producto, {
        where: { id_producto: Equal('prod-1'), id_empresa: Equal('emp-1') },
      });
      expect(repo.manager.findOne).toHaveBeenCalledWith(Proveedor, {
        where: { id_proveedor: Equal('prov-1'), id_empresa: Equal('emp-1') },
      });
    });

    it('accepts plain string relation ids', async () => {
      const repo = mockRepo();
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      await service.create({ ...baseDto(), id_producto: 'prod-1', id_proveedor: 'prov-1' } as any, 'emp-1');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id_producto: { id_producto: 'prod-1' },
          id_proveedor: { id_proveedor: 'prov-1' },
        }),
      );
    });

    it('throws ForbiddenException when the user has no empresa', async () => {
      const repo = mockRepo();
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      await expect(service.create(baseDto() as any, null)).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a producto from another clinic and does not save', async () => {
      const repo = mockRepo();
      sameClinicManager(repo, 'producto');
      const service = new LotesService(repo as any);

      await expect(service.create(baseDto() as any, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a proveedor from another clinic and does not save', async () => {
      const repo = mockRepo();
      sameClinicManager(repo, 'proveedor');
      const service = new LotesService(repo as any);

      await expect(service.create(baseDto() as any, 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('filters by id and the JWT empresa with Equal', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(ownedLote());
      const service = new LotesService(repo as any);

      await service.findOne('lote-1', 'emp-1');

      expect(repo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_lote: 'lote-1', id_empresa: Equal('emp-1') } }),
      );
    });

    it('throws NotFoundException when the lote is not owned', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new LotesService(repo as any);

      await expect(service.findOne('lote-1', 'emp-2')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws NotFoundException for a not-owned lote and does not save', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new LotesService(repo as any);

      await expect(service.update('lote-1', { stock_actual: 5 } as any, 'emp-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a foreign producto and does not save', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(ownedLote());
      sameClinicManager(repo, 'producto');
      const service = new LotesService(repo as any);

      await expect(
        service.update('lote-1', { id_producto: { id_producto: 'prod-x' } } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('saves an owned lote with same-clinic relations', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(ownedLote());
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      const result = await service.update(
        'lote-1',
        { stock_actual: 5, id_proveedor: { id_proveedor: 'prov-1' } } as any,
        'emp-1',
      );

      expect(result).toEqual(
        expect.objectContaining({
          stock_actual: 5,
          id_proveedor: { id_proveedor: 'prov-1' },
          id_empresa: { id_empresa: 'emp-1' },
        }),
      );
    });
  });

  describe('remove', () => {
    it('throws NotFoundException for a not-owned lote and does not remove', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new LotesService(repo as any);

      await expect(service.remove('lote-1', 'emp-2')).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
