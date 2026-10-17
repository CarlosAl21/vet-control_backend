import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { DetalleFacturaService } from './detalle_facturas.service';
import { Factura } from 'src/facturas/entities/factura.entity';
import { DetalleFactura } from './entities/detalle_factura.entity';

// Chainable QueryBuilder mock; getOne/getMany results are set per test.
const mockQb = () => {
  const qb: Record<string, jest.Mock> = {};
  for (const m of ['innerJoinAndSelect', 'leftJoinAndSelect', 'where', 'andWhere']) {
    qb[m] = jest.fn(() => qb);
  }
  qb.getOne = jest.fn();
  qb.getMany = jest.fn();
  return qb;
};

const mockRepo = () => {
  const qb = mockQb();
  const txManager = {
    create: jest.fn((_entity, data) => data),
    save: jest.fn(async (data) => data),
    remove: jest.fn(async (data) => data),
  };
  return {
    qb,
    createQueryBuilder: jest.fn(() => qb),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => data),
    remove: jest.fn(async (data) => data),
    merge: jest.fn((target, data) => Object.assign(target, data)),
    manager: {
      findOne: jest.fn(),
      // Runs the callback with a transaction manager that records create/save/remove.
      tx: txManager,
      transaction: jest.fn(async (cb) => cb(txManager)),
    },
  };
};

// Asserts the detalle lookup joins the factura and scopes it to the given clinic.
const expectClinicScoped = (
  repo: ReturnType<typeof mockRepo>,
  empresaId: string,
) => {
  expect(repo.createQueryBuilder).toHaveBeenCalledWith('detalle');
  expect(repo.qb.innerJoinAndSelect).toHaveBeenCalledWith(
    'detalle.id_factura',
    'factura',
  );
  expect(repo.qb.where).toHaveBeenCalledWith(
    'factura.id_empresa = :empresaId',
    { empresaId },
  );
};

const ownedDetalle = () => ({
  id_detalle: 'd-1',
  cantidad: 2,
  precio_unitario: 5,
  subtotal: 10,
  id_factura: { id_factura: 1, id_empresa: { id_empresa: 'emp-1' } },
  id_lote: { id_lote: 'l-1' },
});

const baseDto = () => ({
  descripcion: 'Medicamento',
  cantidad: 2,
  precio_unitario: 5,
  subtotal: 10,
  id_factura: { id_factura: 1 },
  id_lote: 'l-1',
});

// Resolves the factura only when it is factura 1; lotes only when they are l-1 (both of emp-1).
const setup = (
  opts: { foreignFactura?: boolean; foreignLote?: boolean } = {},
) => {
  const detalleRepo = mockRepo();
  const lotesRepo = mockRepo();
  detalleRepo.manager.findOne.mockImplementation(async (entity: unknown) =>
    entity === Factura && !opts.foreignFactura ? { id_factura: 1 } : null,
  );
  lotesRepo.findOne.mockResolvedValue(
    opts.foreignLote ? null : { id_lote: 'l-1', estado: 'activo' },
  );
  const lotesService = { descontarStock: jest.fn(), reponerStock: jest.fn() };
  const service = new DetalleFacturaService(
    detalleRepo as any,
    lotesRepo as any,
    lotesService as any,
  );
  return { service, detalleRepo, lotesRepo, lotesService };
};

describe('DetalleFacturaService clinic scope', () => {
  describe('findAll', () => {
    it('only returns details whose factura belongs to the JWT empresa', async () => {
      const { service, detalleRepo } = setup();
      const rows = [ownedDetalle()];
      detalleRepo.qb.getMany.mockResolvedValue(rows);

      const result = await service.findAll('emp-1');

      expect(result).toBe(rows);
      expectClinicScoped(detalleRepo, 'emp-1');
      expect(detalleRepo.qb.leftJoinAndSelect).toHaveBeenCalledWith(
        'detalle.id_lote',
        'lote',
      );
    });

    it('keeps the tenant filter when the user has no empresa', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getMany.mockResolvedValue([]);

      await expect(service.findAll(null)).resolves.toEqual([]);
      expectClinicScoped(detalleRepo, null as unknown as string);
    });
  });

  describe('findOne', () => {
    it('filters by id and the factura clinic', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await service.findOne('d-1', 'emp-1');

      expectClinicScoped(detalleRepo, 'emp-1');
      expect(detalleRepo.qb.andWhere).toHaveBeenCalledWith(
        'detalle.id_detalle = :id',
        { id: 'd-1' },
      );
    });

    it('throws NotFoundException for a detalle of another clinic', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(null);

      await expect(service.findOne('d-1', 'emp-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('validates factura and lote against the JWT empresa and decrements stock scoped', async () => {
      const { service, detalleRepo, lotesRepo, lotesService } = setup();

      await service.create(baseDto() as any, 'emp-1');

      expect(detalleRepo.manager.findOne).toHaveBeenCalledWith(Factura, {
        where: { id_factura: Equal(1), id_empresa: Equal('emp-1') },
      });
      expect(lotesRepo.findOne).toHaveBeenCalledWith({
        where: { id_lote: Equal('l-1'), id_empresa: Equal('emp-1') },
      });
      expect(lotesService.descontarStock).toHaveBeenCalledWith(
        'l-1',
        2,
        'emp-1',
        detalleRepo.manager.tx,
      );
      expect(detalleRepo.manager.tx.create).toHaveBeenCalledWith(
        DetalleFactura,
        expect.objectContaining({
          id_factura: { id_factura: 1 },
          id_lote: { id_lote: 'l-1' },
          subtotal: 10,
        }),
      );
      expect(detalleRepo.manager.tx.save).toHaveBeenCalled();
    });

    it('does not keep the decrement when the detalle save fails (same transaction)', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.manager.tx.save.mockRejectedValue(new Error('db down'));

      await expect(service.create(baseDto() as any, 'emp-1')).rejects.toThrow('db down');
      // The decrement ran on the transaction's manager, so the rollback undoes it.
      expect(lotesService.descontarStock).toHaveBeenCalledWith('l-1', 2, 'emp-1', detalleRepo.manager.tx);
      expect(detalleRepo.manager.transaction).toHaveBeenCalledTimes(1);
    });

    it('creates a detalle without lote and does not touch stock', async () => {
      const { service, detalleRepo, lotesService } = setup();
      const { id_lote, ...dto } = baseDto();

      await service.create(dto as any, 'emp-1');

      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.manager.tx.create).toHaveBeenCalledWith(
        DetalleFactura,
        expect.objectContaining({ id_lote: null }),
      );
    });

    it('throws ForbiddenException when the user has no empresa', async () => {
      const { service, detalleRepo, lotesService } = setup();

      await expect(
        service.create(baseDto() as any, null),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a factura of another clinic and does not decrement stock', async () => {
      const { service, detalleRepo, lotesService } = setup({
        foreignFactura: true,
      });

      await expect(
        service.create(baseDto() as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a lote of another clinic and saves nothing', async () => {
      const { service, detalleRepo, lotesService } = setup({
        foreignLote: true,
      });

      await expect(
        service.create(baseDto() as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws NotFoundException for a detalle of another clinic and does not save', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(null);

      await expect(
        service.update('d-1', { cantidad: 3 } as any, 'emp-2'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when reassigning to a lote of another clinic', async () => {
      const { service, detalleRepo } = setup({ foreignLote: true });
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await expect(
        service.update('d-1', { id_lote: 'l-x' } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when reassigning to a factura of another clinic', async () => {
      const { service, detalleRepo } = setup({ foreignFactura: true });
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await expect(
        service.update(
          'd-1',
          { id_factura: { id_factura: 9 } } as any,
          'emp-1',
        ),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.manager.tx.save).not.toHaveBeenCalled();
    });

    it('saves an owned detalle with a same-clinic lote and recomputes the subtotal', async () => {
      const { service, detalleRepo, lotesRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      const result = await service.update(
        'd-1',
        { cantidad: 3, id_lote: 'l-1' } as any,
        'emp-1',
      );

      expect(lotesRepo.findOne).toHaveBeenCalledWith({
        where: { id_lote: Equal('l-1'), id_empresa: Equal('emp-1') },
      });
      expect(result).toEqual(
        expect.objectContaining({ cantidad: 3, subtotal: 15 }),
      );
    });
  });

  describe('update stock', () => {
    const tx = (repo: ReturnType<typeof mockRepo>) => repo.manager.tx;

    it('takes only the extra units when cantidad grows on the same lote', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await service.update('d-1', { cantidad: 5 } as any, 'emp-1');

      expect(lotesService.descontarStock).toHaveBeenCalledWith('l-1', 3, 'emp-1', tx(detalleRepo));
      expect(lotesService.reponerStock).not.toHaveBeenCalled();
    });

    it('gives back the difference when cantidad shrinks on the same lote', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await service.update('d-1', { cantidad: 1 } as any, 'emp-1');

      expect(lotesService.reponerStock).toHaveBeenCalledWith('l-1', 1, 'emp-1', tx(detalleRepo));
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
    });

    it('does not touch stock when neither cantidad nor lote change', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await service.update('d-1', { precio_unitario: 9 } as any, 'emp-1');

      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(lotesService.reponerStock).not.toHaveBeenCalled();
    });

    it('returns the old units to the old lote and takes the new ones from the new lote', async () => {
      const { service, detalleRepo, lotesRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());
      lotesRepo.findOne.mockResolvedValue({ id_lote: 'l-2', estado: 'activo' });

      await service.update('d-1', { id_lote: 'l-2', cantidad: 4 } as any, 'emp-1');

      expect(lotesService.reponerStock).toHaveBeenCalledWith('l-1', 2, 'emp-1', tx(detalleRepo));
      expect(lotesService.descontarStock).toHaveBeenCalledWith('l-2', 4, 'emp-1', tx(detalleRepo));
    });

    it('takes the stock when a lote is assigned to a detalle that had none', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue({ ...ownedDetalle(), id_lote: null });

      await service.update('d-1', { id_lote: 'l-1' } as any, 'emp-1');

      expect(lotesService.reponerStock).not.toHaveBeenCalled();
      expect(lotesService.descontarStock).toHaveBeenCalledWith('l-1', 2, 'emp-1', tx(detalleRepo));
    });

    it('propagates the stock error as 400 and does not save', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());
      lotesService.descontarStock.mockRejectedValue(new BadRequestException('Cantidad solicitada supera el stock disponible'));

      await expect(service.update('d-1', { cantidad: 99 } as any, 'emp-1')).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(tx(detalleRepo).save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('gives the units back to the lote and removes the detalle in one transaction', async () => {
      const { service, detalleRepo, lotesService } = setup();
      const detalle = ownedDetalle();
      detalleRepo.qb.getOne.mockResolvedValue(detalle);

      await service.remove('d-1', 'emp-1');

      expect(lotesService.reponerStock).toHaveBeenCalledWith('l-1', 2, 'emp-1', detalleRepo.manager.tx);
      expect(detalleRepo.manager.tx.remove).toHaveBeenCalledWith(detalle);
    });

    it('removes a detalle without lote and does not touch stock', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue({ ...ownedDetalle(), id_lote: null });

      await service.remove('d-1', 'emp-1');

      expect(lotesService.reponerStock).not.toHaveBeenCalled();
      expect(detalleRepo.manager.tx.remove).toHaveBeenCalled();
    });

    it('does not remove the detalle when the stock cannot be restored', async () => {
      const { service, detalleRepo, lotesService } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());
      lotesService.reponerStock.mockRejectedValue(new NotFoundException('Lote no encontrado'));

      await expect(service.remove('d-1', 'emp-1')).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.manager.tx.remove).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a detalle of another clinic and does not remove', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(null);

      await expect(service.remove('d-1', 'emp-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(detalleRepo.manager.tx.remove).not.toHaveBeenCalled();
    });
  });
});
