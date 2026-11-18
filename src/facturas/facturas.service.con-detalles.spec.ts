import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FacturasService } from './facturas.service';
import { CreateFacturaConDetallesDto } from './dto/create-factura-con-detalles.dto';
import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';

const future = (days: number) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

type FakeLote = {
  id_lote: string;
  id_producto: string;
  empresa?: string;
  estado?: string;
  fecha_venc?: string;
  fecha_entrada?: string;
  stock_actual: number;
};

const defaultLotes = (): FakeLote[] => [
  { id_lote: 'lote-1', id_producto: 'p-1', stock_actual: 10 },
  { id_lote: 'lote-2', id_producto: 'p-1', stock_actual: 1 },
];

// In-memory lotes; the fake transaction restores them when the callback throws, like a real rollback.
function buildService(lotesInit: FakeLote[] = defaultLotes(), productos: Record<string, string> = { 'p-1': 'emp-1' }) {
  const lotes = lotesInit.map((l) => ({
    empresa: 'emp-1',
    estado: 'activo',
    fecha_venc: future(300),
    fecha_entrada: '2025-01-01',
    ...l,
  }));
  const state = { lotes, saved: [] as any[] };
  const val = (op: any) => (op && typeof op === 'object' && 'value' in op ? op.value : op);
  const manager = {
    create: jest.fn((_entity, data) => ({ ...data })),
    save: jest.fn(async (data) => {
      const saved = { ...data };
      if (!('id_detalle' in saved) && 'metodo_pago' in saved) saved.id_factura = 1;
      state.saved.push(saved);
      return saved;
    }),
    findOne: jest.fn(async (entity, { where }) => {
      if (entity.name === 'Producto') {
        return productos[val(where.id_producto)] === val(where.id_empresa) ? { id_producto: val(where.id_producto) } : null;
      }
      const l = state.lotes.find((x) => x.id_lote === val(where.id_lote) && x.empresa === val(where.id_empresa));
      return l ? { ...l, id_producto: { id_producto: l.id_producto } } : null;
    }),
    find: jest.fn(async (_entity, { where, order }) =>
      state.lotes
        .filter(
          (l) =>
            l.id_producto === val(where.id_producto) &&
            l.empresa === val(where.id_empresa) &&
            l.estado === where.estado &&
            l.stock_actual > 0,
        )
        .sort((a, b) => a.fecha_venc.localeCompare(b.fecha_venc) || a.fecha_entrada.localeCompare(b.fecha_entrada))
        .map((l) => ({ ...l })),
    ),
  };
  const facturaRepository = {
    manager: {
      transaction: jest.fn(async (cb) => {
        const snapshot = { lotes: state.lotes.map((l) => ({ ...l })), saved: [...state.saved] };
        try {
          return await cb(manager);
        } catch (error) {
          state.lotes = snapshot.lotes;
          state.saved = snapshot.saved;
          throw error;
        }
      }),
    },
  };
  const clienteRepository = { findOne: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) };
  const lotesService = {
    descontarStock: jest.fn(async (id: string, cantidad: number, empresaId: string) => {
      const lote = state.lotes.find((l) => l.id_lote === id && l.empresa === empresaId);
      if (!lote) throw new NotFoundException('Lote no encontrado');
      if (lote.estado !== 'activo' || lote.fecha_venc < future(0)) {
        throw new BadRequestException('El producto no está disponible');
      }
      if (cantidad > lote.stock_actual) {
        throw new BadRequestException('Cantidad solicitada supera el stock disponible');
      }
      lote.stock_actual -= cantidad;
    }),
  };
  const service = new FacturasService(
    facturaRepository as any,
    clienteRepository as any,
    {} as any,
    {} as any,
    {} as any,
    lotesService as any,
  );
  const stock = (id: string) => state.lotes.find((l) => l.id_lote === id)!.stock_actual;
  return { service, state, manager, lotesService, clienteRepository, stock };
}

const dto = (detalles: any[], extra: object = {}) =>
  ({ fecha_emision: '2025-05-14', metodo_pago: 'Efectivo', id_cliente: 'c-1', detalles, ...extra }) as any;

describe('FacturasService.createWithDetalles', () => {
  it('creates the factura and its detalles, discounting stock and computing the total', async () => {
    const { service, state, lotesService, manager, stock } = buildService();

    const factura = await service.createWithDetalles(
      dto([
        { descripcion: 'A', cantidad: 2, precio_unitario: 10.5, id_lote: 'lote-1' },
        { descripcion: 'B', cantidad: 1, precio_unitario: 4 },
      ]),
      'emp-1',
    );

    expect(factura.total).toBe(25);
    expect(factura.estado).toBe('pendiente');
    expect(factura.id_empresa).toEqual({ id_empresa: 'emp-1' });
    expect(factura.detalles.map((d) => d.subtotal)).toEqual([21, 4]);
    expect(factura.detalles[0].id_lote).toEqual({ id_lote: 'lote-1' });
    expect(factura.detalles[1].id_lote).toBeNull();
    expect(factura.detalles[0].id_factura).toEqual({ id_factura: 1 });
    expect(lotesService.descontarStock).toHaveBeenCalledTimes(1);
    expect(lotesService.descontarStock).toHaveBeenCalledWith('lote-1', 2, 'emp-1', manager);
    expect(stock('lote-1')).toBe(8);
    expect(manager.create).toHaveBeenCalledWith(DetalleFactura, expect.anything());
  });

  it('rolls back the factura, detalles and the first stock decrement when the second detalle fails', async () => {
    const { service, state, stock } = buildService();

    await expect(
      service.createWithDetalles(
        dto([
          { descripcion: 'A', cantidad: 3, precio_unitario: 5, id_lote: 'lote-1' },
          { descripcion: 'B', cantidad: 5, precio_unitario: 5, id_lote: 'lote-2' },
        ]),
        'emp-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(stock('lote-1')).toBe(10);
    expect(stock('lote-2')).toBe(1);
    expect(state.saved).toHaveLength(0);
  });

  it('rejects a lote of another clinic and saves nothing', async () => {
    const { service, state } = buildService();

    await expect(
      service.createWithDetalles(
        dto([{ descripcion: 'A', cantidad: 1, precio_unitario: 5, id_lote: 'lote-foreign' }]),
        'emp-1',
      ),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(state.saved).toHaveLength(0);
  });

  it('accumulates stock across detalles that share a lote', async () => {
    const { service, stock } = buildService();

    await expect(
      service.createWithDetalles(
        dto([
          { descripcion: 'A', cantidad: 6, precio_unitario: 1, id_lote: 'lote-1' },
          { descripcion: 'B', cantidad: 6, precio_unitario: 1, id_lote: 'lote-1' },
        ]),
        'emp-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(stock('lote-1')).toBe(10);
  });

  it('ignores the client total and subtotals and the body id_empresa', async () => {
    const { service } = buildService();

    const factura = await service.createWithDetalles(
      dto(
        [{ descripcion: 'A', cantidad: 2, precio_unitario: 3, subtotal: 999 }],
        { total: 12345, id_empresa: { id_empresa: 'emp-other' } },
      ),
      'emp-1',
    );

    expect(factura.total).toBe(6);
    expect(factura.detalles[0].subtotal).toBe(6);
    expect(factura.id_empresa).toEqual({ id_empresa: 'emp-1' });
  });

  it('scopes the cliente to the JWT empresa and rejects one from another clinic', async () => {
    const { service, clienteRepository, state } = buildService();
    clienteRepository.findOne.mockResolvedValue(null);

    await expect(
      service.createWithDetalles(dto([{ descripcion: 'A', cantidad: 1, precio_unitario: 1 }]), 'emp-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(state.saved).toHaveLength(0);
  });

  it('throws ForbiddenException when the user has no empresa', async () => {
    const { service } = buildService();

    await expect(
      service.createWithDetalles(dto([{ descripcion: 'A', cantidad: 1, precio_unitario: 1 }]), null),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe('FacturasService.createWithDetalles resolving the lote from id_producto (FEFO)', () => {
  const lines = (...l: object[]) => dto(l.map((x) => ({ descripcion: 'P', precio_unitario: 2, ...x })));

  it('picks the lote that expires first, tie-broken by fecha_entrada', async () => {
    const { service, stock } = buildService([
      { id_lote: 'late', id_producto: 'p-1', stock_actual: 5, fecha_venc: future(200) },
      { id_lote: 'soon-new', id_producto: 'p-1', stock_actual: 5, fecha_venc: future(30), fecha_entrada: '2025-03-01' },
      { id_lote: 'soon-old', id_producto: 'p-1', stock_actual: 5, fecha_venc: future(30), fecha_entrada: '2025-02-01' },
    ]);

    const factura = await service.createWithDetalles(lines({ cantidad: 2, id_producto: 'p-1' }), 'emp-1');

    expect(factura.detalles).toHaveLength(1);
    expect(factura.detalles[0].id_lote).toEqual({ id_lote: 'soon-old' });
    expect(factura.detalles[0]).not.toHaveProperty('id_producto');
    expect([stock('soon-old'), stock('soon-new'), stock('late')]).toEqual([3, 5, 5]);
  });

  it('splits one line across lotes, one detalle per lote, total = sum of subtotals', async () => {
    const { service, stock } = buildService([
      { id_lote: 'a', id_producto: 'p-1', stock_actual: 3, fecha_venc: future(30) },
      { id_lote: 'b', id_producto: 'p-1', stock_actual: 10, fecha_venc: future(60) },
    ]);

    const factura = await service.createWithDetalles(lines({ cantidad: 5, precio_unitario: 2.5, id_producto: 'p-1' }), 'emp-1');

    expect(factura.detalles.map((d) => [d.id_lote, d.cantidad, d.subtotal, d.precio_unitario, d.descripcion])).toEqual([
      [{ id_lote: 'a' }, 3, 7.5, 2.5, 'P'],
      [{ id_lote: 'b' }, 2, 5, 2.5, 'P'],
    ]);
    expect(factura.total).toBe(12.5);
    expect([stock('a'), stock('b')]).toEqual([0, 8]);
  });

  it('answers 400 and rolls back when the eligible stock is not enough', async () => {
    const { service, state, stock } = buildService([
      { id_lote: 'a', id_producto: 'p-1', stock_actual: 3 },
      { id_lote: 'b', id_producto: 'p-1', stock_actual: 2 },
    ]);

    await expect(
      service.createWithDetalles(lines({ cantidad: 1, id_producto: 'p-1' }, { cantidad: 9, id_producto: 'p-1' }), 'emp-1'),
    ).rejects.toThrow('Cantidad solicitada supera el stock disponible');

    expect([stock('a'), stock('b')]).toEqual([3, 2]);
    expect(state.saved).toHaveLength(0);
  });

  it('ignores expired and inactive lotes, and answers 400 when none is eligible', async () => {
    const { service, stock } = buildService([
      { id_lote: 'expired', id_producto: 'p-1', stock_actual: 9, fecha_venc: '2020-01-01' },
      { id_lote: 'inactive', id_producto: 'p-1', stock_actual: 9, estado: 'inactivo' },
      { id_lote: 'agotado', id_producto: 'p-1', stock_actual: 0, estado: 'agotado' },
      { id_lote: 'ok', id_producto: 'p-1', stock_actual: 4, fecha_venc: future(90) },
    ]);

    const factura = await service.createWithDetalles(lines({ cantidad: 2, id_producto: 'p-1' }), 'emp-1');
    expect(factura.detalles.map((d) => d.id_lote)).toEqual([{ id_lote: 'ok' }]);
    expect(stock('expired')).toBe(9);

    const none = buildService([{ id_lote: 'expired', id_producto: 'p-1', stock_actual: 9, fecha_venc: '2020-01-01' }]);
    await expect(
      none.service.createWithDetalles(lines({ cantidad: 1, id_producto: 'p-1' }), 'emp-1'),
    ).rejects.toThrow('El producto no está disponible');
  });

  it('answers 404 for a producto of another clinic or a missing one', async () => {
    const { service, state } = buildService(defaultLotes(), { 'p-1': 'emp-1', 'p-foreign': 'emp-other' });

    await expect(
      service.createWithDetalles(lines({ cantidad: 1, id_producto: 'p-foreign' }), 'emp-1'),
    ).rejects.toThrow('Producto no encontrado');
    await expect(
      service.createWithDetalles(lines({ cantidad: 1, id_producto: 'p-missing' }), 'emp-1'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(state.saved).toHaveLength(0);
  });

  it('does not assign the same units twice when two lines share a producto', async () => {
    const { service, stock } = buildService([
      { id_lote: 'a', id_producto: 'p-1', stock_actual: 4, fecha_venc: future(30) },
      { id_lote: 'b', id_producto: 'p-1', stock_actual: 4, fecha_venc: future(60) },
    ]);

    const factura = await service.createWithDetalles(
      lines({ cantidad: 3, id_producto: 'p-1' }, { cantidad: 3, id_producto: 'p-1' }),
      'emp-1',
    );

    expect(factura.detalles.map((d) => [d.id_lote, d.cantidad])).toEqual([
      [{ id_lote: 'a' }, 3],
      [{ id_lote: 'a' }, 1],
      [{ id_lote: 'b' }, 2],
    ]);
    expect([stock('a'), stock('b')]).toEqual([0, 2]);
  });

  it('rejects an id_lote that does not belong to the id_producto', async () => {
    const { service, state, stock } = buildService([
      { id_lote: 'a', id_producto: 'p-1', stock_actual: 4 },
      { id_lote: 'other', id_producto: 'p-2', stock_actual: 4 },
    ]);

    await expect(
      service.createWithDetalles(lines({ cantidad: 1, id_producto: 'p-1', id_lote: 'other' }), 'emp-1'),
    ).rejects.toThrow('El lote no pertenece al producto');
    expect(stock('other')).toBe(4);
    expect(state.saved).toHaveLength(0);
  });

  it('keeps the explicit id_lote behaviour when it matches the id_producto', async () => {
    const { service, stock } = buildService();

    const factura = await service.createWithDetalles(lines({ cantidad: 2, id_producto: 'p-1', id_lote: 'lote-1' }), 'emp-1');

    expect(factura.detalles.map((d) => [d.id_lote, d.cantidad])).toEqual([[{ id_lote: 'lote-1' }, 2]]);
    expect(stock('lote-1')).toBe(8);
  });
});

describe('CreateFacturaConDetallesDto validation', () => {
  const check = (body: object) => validate(plainToInstance(CreateFacturaConDetallesDto, body));
  const valid = {
    fecha_emision: '2025-05-14T10:30:00Z',
    metodo_pago: 'Efectivo',
    id_cliente: 'c-1',
    detalles: [{ descripcion: 'A', cantidad: 1, precio_unitario: 0 }],
  };

  it('accepts a valid body with a free detalle (precio 0, no lote)', async () => {
    expect(await check(valid)).toHaveLength(0);
  });

  it('requires at least one detalle', async () => {
    expect(await check({ ...valid, detalles: [] })).not.toHaveLength(0);
  });

  it('rejects cantidad <= 0 and negative precio_unitario', async () => {
    const bad = (d: object) => check({ ...valid, detalles: [{ ...valid.detalles[0], ...d }] });
    expect(await bad({ cantidad: 0 })).not.toHaveLength(0);
    expect(await bad({ precio_unitario: -1 })).not.toHaveLength(0);
  });
});
