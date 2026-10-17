import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { LotesService } from './lotes.service';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

const mockRepo = () => ({
  findOne: jest.fn(async () => ({ id_lote: 'lote-1' }) as any),
  create: jest.fn((data) => data),
  save: jest.fn(async (data) => ({ id_lote: 'lote-1', ...data })),
  remove: jest.fn(async () => undefined),
  manager: { findOne: jest.fn() },
});

const baseDto = () => ({
  codigo_lote: 'LT-1',
  fecha_entrada: new Date('2026-01-01'),
  fecha_venc: new Date('2099-01-01'),
  stock_actual: 10,
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

    it('ignores a client estado and returns the findOne result with relation names', async () => {
      const repo = mockRepo();
      sameClinicManager(repo);
      const full = { ...ownedLote(), id_producto: { id_producto: 'prod-1', nombre: 'Vacuna' } };
      repo.save.mockResolvedValue({ id_lote: 'lote-1' });
      repo.findOne.mockResolvedValue(full);
      const service = new LotesService(repo as any);

      const result = await service.create({ ...baseDto(), estado: 'agotado' } as any, 'emp-1');

      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ estado: 'activo' }));
      expect(result).toBe(full);
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

    it('does not mutate estado on read', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue({ ...ownedLote(), estado: 'agotado' });
      const service = new LotesService(repo as any);

      const result = await service.findOne('lote-1', 'emp-1');

      expect(result.estado).toBe('agotado');
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('reports an expired active lote as vencido without saving', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue({ ...ownedLote(), estado: 'activo', fecha_venc: new Date('2020-01-01') });
      const service = new LotesService(repo as any);

      const result = await service.findOne('lote-1', 'emp-1');

      expect(result.estado).toBe('vencido');
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('keeps agotado and inactivo even when expired', async () => {
      const repo = mockRepo();
      const service = new LotesService(repo as any);
      for (const estado of ['agotado', 'inactivo']) {
        repo.findOne.mockResolvedValue({ ...ownedLote(), estado, fecha_venc: new Date('2020-01-01') });
        expect((await service.findOne('lote-1', 'emp-1')).estado).toBe(estado);
      }
    });

    it('findAll derives vencido without saving', async () => {
      const repo = mockRepo() as any;
      repo.find = jest.fn().mockResolvedValue([
        { ...ownedLote(), estado: 'activo', fecha_venc: new Date('2020-01-01') },
        { ...ownedLote(), estado: 'activo' },
      ]);
      const service = new LotesService(repo);

      const result = await service.findAll('emp-1');

      expect(result.map((l) => l.estado)).toEqual(['vencido', 'activo']);
      expect(repo.save).not.toHaveBeenCalled();
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
      repo.findOne.mockImplementation(async () => ({ ...ownedLote(), stock_actual: 1 }));
      repo.save.mockImplementation(async (l) => {
        repo.findOne.mockResolvedValue({ ...l, id_proveedor: { id_proveedor: 'prov-1', nombre: 'Prov' } });
        return l;
      });
      sameClinicManager(repo);
      const service = new LotesService(repo as any);

      const result = await service.update(
        'lote-1',
        { stock_actual: 5, estado: 'agotado', id_proveedor: { id_proveedor: 'prov-1' } } as any,
        'emp-1',
      );

      expect(repo.save).toHaveBeenCalledWith(expect.not.objectContaining({ estado: 'agotado' }));
      expect(result).toEqual(
        expect.objectContaining({
          stock_actual: 5,
          id_proveedor: { id_proveedor: 'prov-1', nombre: 'Prov' },
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

  describe('descontarStock', () => {
    it('scopes the lote lookup to the JWT empresa and decrements stock', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue({ ...ownedLote(), stock_actual: 5 });
      const service = new LotesService(repo as any);

      await service.descontarStock('lote-1', 2, 'emp-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id_lote: Equal('lote-1'), id_empresa: Equal('emp-1') },
      });
      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ stock_actual: 3, estado: 'activo' }));
    });

    it('marks the lote agotado only when stock reaches zero', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue({ ...ownedLote(), stock_actual: 3 });
      const service = new LotesService(repo as any);

      await service.descontarStock('lote-1', 3, 'emp-1');

      expect(repo.save).toHaveBeenCalledWith(expect.objectContaining({ stock_actual: 0, estado: 'agotado' }));
    });

    it.each([
      ['inactivo', new Date('2099-01-01')],
      ['vencido', new Date('2099-01-01')],
      ['activo', new Date('2020-01-01')],
    ])('rejects selling from a %s lote (fecha %s) and does not save', async (estado, fecha_venc) => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue({ ...ownedLote(), stock_actual: 5, estado, fecha_venc });
      const service = new LotesService(repo as any);

      await expect(service.descontarStock('lote-1', 1, 'emp-1')).rejects.toBeInstanceOf(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a lote from another clinic and does not save', async () => {
      const repo = mockRepo();
      repo.findOne.mockResolvedValue(null);
      const service = new LotesService(repo as any);

      await expect(service.descontarStock('lote-1', 2, 'emp-2')).rejects.toBeInstanceOf(NotFoundException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
