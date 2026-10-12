import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { DetalleFacturaService } from './detalle_facturas.service';
import { Factura } from 'src/facturas/entities/factura.entity';

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
  return {
    qb,
    createQueryBuilder: jest.fn(() => qb),
    findOne: jest.fn(),
    create: jest.fn((data) => data),
    save: jest.fn(async (data) => data),
    remove: jest.fn(async (data) => data),
    merge: jest.fn((target, data) => Object.assign(target, data)),
    manager: { findOne: jest.fn() },
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
  const lotesService = { descontarStock: jest.fn() };
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
      );
      expect(detalleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id_factura: { id_factura: 1 },
          id_lote: { id_lote: 'l-1' },
          subtotal: 10,
        }),
      );
      expect(detalleRepo.save).toHaveBeenCalled();
    });

    it('creates a detalle without lote and does not touch stock', async () => {
      const { service, detalleRepo, lotesService } = setup();
      const { id_lote, ...dto } = baseDto();

      await service.create(dto as any, 'emp-1');

      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ id_lote: null }),
      );
    });

    it('throws ForbiddenException when the user has no empresa', async () => {
      const { service, detalleRepo, lotesService } = setup();

      await expect(
        service.create(baseDto() as any, null),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a factura of another clinic and does not decrement stock', async () => {
      const { service, detalleRepo, lotesService } = setup({
        foreignFactura: true,
      });

      await expect(
        service.create(baseDto() as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a lote of another clinic and saves nothing', async () => {
      const { service, detalleRepo, lotesService } = setup({
        foreignLote: true,
      });

      await expect(
        service.create(baseDto() as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(lotesService.descontarStock).not.toHaveBeenCalled();
      expect(detalleRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('throws NotFoundException for a detalle of another clinic and does not save', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(null);

      await expect(
        service.update('d-1', { cantidad: 3 } as any, 'emp-2'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when reassigning to a lote of another clinic', async () => {
      const { service, detalleRepo } = setup({ foreignLote: true });
      detalleRepo.qb.getOne.mockResolvedValue(ownedDetalle());

      await expect(
        service.update('d-1', { id_lote: 'l-x' } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(detalleRepo.save).not.toHaveBeenCalled();
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
      expect(detalleRepo.save).not.toHaveBeenCalled();
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

  describe('remove', () => {
    it('throws NotFoundException for a detalle of another clinic and does not remove', async () => {
      const { service, detalleRepo } = setup();
      detalleRepo.qb.getOne.mockResolvedValue(null);

      await expect(service.remove('d-1', 'emp-2')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(detalleRepo.remove).not.toHaveBeenCalled();
    });
  });
});
