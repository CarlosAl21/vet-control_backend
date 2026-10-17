import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { LotesService } from './lotes.service';
import { Lote } from './entities/lote.entity';
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

  // Manager whose lote lookup returns `lote` and whose UPDATE query builder reports `affected` rows.
  const stockManager = (lote: unknown, affected = 1) => {
    const qb: Record<string, jest.Mock> = {};
    for (const m of ['update', 'set', 'where', 'andWhere', 'setParameter']) qb[m] = jest.fn(() => qb);
    qb.execute = jest.fn(async () => ({ affected }));
    return { qb, findOne: jest.fn(async () => lote), createQueryBuilder: jest.fn(() => qb) };
  };

  describe('descontarStock', () => {
    it('scopes the lote lookup to the JWT empresa and decrements stock atomically', async () => {
      const manager = stockManager({ ...ownedLote(), stock_actual: 5 });
      const service = new LotesService(mockRepo() as any);

      await service.descontarStock('lote-1', 2, 'emp-1', manager as any);

      expect(manager.findOne).toHaveBeenCalledWith(Lote, {
        where: { id_lote: Equal('lote-1'), id_empresa: Equal('emp-1') },
      });
      expect(manager.qb.update).toHaveBeenCalledWith(Lote);
      expect(manager.qb.where).toHaveBeenCalledWith(expect.any(String), { id_lote: 'lote-1', empresaId: 'emp-1' });
      expect(manager.qb.setParameter).toHaveBeenCalledWith('cantidad', 2);
      expect(manager.qb.execute).toHaveBeenCalledTimes(1);
    });

    it('uses the repository manager when no transaction manager is given', async () => {
      const repo = mockRepo();
      const manager = stockManager({ ...ownedLote(), stock_actual: 5 });
      repo.manager = manager as any;
      const service = new LotesService(repo as any);

      await service.descontarStock('lote-1', 1, 'emp-1');

      expect(manager.qb.execute).toHaveBeenCalledTimes(1);
    });

    it('rejects when a concurrent sale already took the stock (no row updated)', async () => {
      const manager = stockManager({ ...ownedLote(), stock_actual: 5 }, 0);
      const service = new LotesService(mockRepo() as any);

      await expect(service.descontarStock('lote-1', 2, 'emp-1', manager as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rejects a quantity above the stock without updating', async () => {
      const manager = stockManager({ ...ownedLote(), stock_actual: 1 });
      const service = new LotesService(mockRepo() as any);

      await expect(service.descontarStock('lote-1', 2, 'emp-1', manager as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.qb.execute).not.toHaveBeenCalled();
    });

    it.each([0, -3, 1.5])('rejects the non-positive-integer quantity %s without touching stock', async (cantidad) => {
      const manager = stockManager({ ...ownedLote(), stock_actual: 5 });
      const service = new LotesService(mockRepo() as any);

      await expect(service.descontarStock('lote-1', cantidad, 'emp-1', manager as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.qb.execute).not.toHaveBeenCalled();
    });

    it.each([
      ['inactivo', new Date('2099-01-01')],
      ['vencido', new Date('2099-01-01')],
      ['activo', new Date('2020-01-01')],
    ])('rejects selling from a %s lote (fecha %s) and does not update', async (estado, fecha_venc) => {
      const manager = stockManager({ ...ownedLote(), stock_actual: 5, estado, fecha_venc });
      const service = new LotesService(mockRepo() as any);

      await expect(service.descontarStock('lote-1', 1, 'emp-1', manager as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.qb.execute).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a lote from another clinic and does not update', async () => {
      const manager = stockManager(null);
      const service = new LotesService(mockRepo() as any);

      await expect(service.descontarStock('lote-1', 2, 'emp-2', manager as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(manager.qb.execute).not.toHaveBeenCalled();
    });
  });

  describe('reponerStock', () => {
    it('atomically gives the units back, scoped to the JWT empresa', async () => {
      const manager = stockManager(null);
      const service = new LotesService(mockRepo() as any);

      await service.reponerStock('lote-1', 4, 'emp-1', manager as any);

      expect(manager.qb.update).toHaveBeenCalledWith(Lote);
      expect(manager.qb.where).toHaveBeenCalledWith(expect.any(String), { id_lote: 'lote-1', empresaId: 'emp-1' });
      expect(manager.qb.setParameter).toHaveBeenCalledWith('cantidad', 4);
    });

    it('throws NotFoundException when no lote of the clinic matches', async () => {
      const manager = stockManager(null, 0);
      const service = new LotesService(mockRepo() as any);

      await expect(service.reponerStock('lote-1', 4, 'emp-2', manager as any)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('rejects a non-positive quantity', async () => {
      const manager = stockManager(null);
      const service = new LotesService(mockRepo() as any);

      await expect(service.reponerStock('lote-1', -1, 'emp-1', manager as any)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(manager.qb.execute).not.toHaveBeenCalled();
    });
  });
});
