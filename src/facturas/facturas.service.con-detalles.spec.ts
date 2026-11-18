import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FacturasService } from './facturas.service';
import { CreateFacturaConDetallesDto } from './dto/create-factura-con-detalles.dto';
import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';

// In-memory stock; the fake transaction restores it when the callback throws, like a real rollback.
function buildService(stock: Record<string, number> = { 'lote-1': 10, 'lote-2': 1 }) {
  const state = { stock: { ...stock }, saved: [] as any[] };
  const manager = {
    create: jest.fn((_entity, data) => ({ ...data })),
    save: jest.fn(async (data) => {
      const saved = { ...data };
      if (!('id_detalle' in saved) && 'metodo_pago' in saved) saved.id_factura = 1;
      state.saved.push(saved);
      return saved;
    }),
  };
  const facturaRepository = {
    manager: {
      transaction: jest.fn(async (cb) => {
        const snapshot = { stock: { ...state.stock }, saved: [...state.saved] };
        try {
          return await cb(manager);
        } catch (error) {
          state.stock = snapshot.stock;
          state.saved = snapshot.saved;
          throw error;
        }
      }),
    },
  };
  const clienteRepository = { findOne: jest.fn().mockResolvedValue({ id_cliente: 'c-1' }) };
  const lotesService = {
    descontarStock: jest.fn(async (id: string, cantidad: number, empresaId: string) => {
      if (id === 'lote-foreign') throw new NotFoundException('Lote no encontrado');
      if (cantidad > state.stock[id]) {
        throw new BadRequestException('Cantidad solicitada supera el stock disponible');
      }
      state.stock[id] -= cantidad;
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
  return { service, state, manager, lotesService, clienteRepository };
}

const dto = (detalles: any[], extra: object = {}) =>
  ({ fecha_emision: '2025-05-14', metodo_pago: 'Efectivo', id_cliente: 'c-1', detalles, ...extra }) as any;

describe('FacturasService.createWithDetalles', () => {
  it('creates the factura and its detalles, discounting stock and computing the total', async () => {
    const { service, state, lotesService, manager } = buildService();

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
    expect(state.stock['lote-1']).toBe(8);
    expect(manager.create).toHaveBeenCalledWith(DetalleFactura, expect.anything());
  });

  it('rolls back the factura, detalles and the first stock decrement when the second detalle fails', async () => {
    const { service, state } = buildService();

    await expect(
      service.createWithDetalles(
        dto([
          { descripcion: 'A', cantidad: 3, precio_unitario: 5, id_lote: 'lote-1' },
          { descripcion: 'B', cantidad: 5, precio_unitario: 5, id_lote: 'lote-2' },
        ]),
        'emp-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(state.stock['lote-1']).toBe(10);
    expect(state.stock['lote-2']).toBe(1);
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
    const { service, state } = buildService();

    await expect(
      service.createWithDetalles(
        dto([
          { descripcion: 'A', cantidad: 6, precio_unitario: 1, id_lote: 'lote-1' },
          { descripcion: 'B', cantidad: 6, precio_unitario: 1, id_lote: 'lote-1' },
        ]),
        'emp-1',
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(state.stock['lote-1']).toBe(10);
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
