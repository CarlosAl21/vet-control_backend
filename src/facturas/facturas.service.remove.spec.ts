import { NotFoundException } from '@nestjs/common';
import { FacturasService } from './facturas.service';
import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';

// The fake transaction restores the lotes when the callback throws, like a real rollback.
function buildService(detalles: any[], lotes: Record<string, number>, failRemove = false) {
  const state = { lotes: { ...lotes }, removed: [] as any[] };
  const factura = { id_factura: 7, id_empresa: { id_empresa: 'emp-1' } };
  const qb: Record<string, jest.Mock> = {};
  for (const m of ['leftJoinAndSelect', 'where']) qb[m] = jest.fn(() => qb);
  qb.getMany = jest.fn(async () => detalles);
  const manager = {
    createQueryBuilder: jest.fn(() => qb),
    remove: jest.fn(async (data) => {
      if (failRemove && !Array.isArray(data)) throw new Error('db down');
      state.removed.push(data);
      return data;
    }),
  };
  const facturaRepository = {
    findOne: jest.fn(async () => factura),
    manager: {
      transaction: jest.fn(async (cb) => {
        const snapshot = { ...state.lotes };
        try {
          return await cb(manager);
        } catch (error) {
          state.lotes = snapshot;
          throw error;
        }
      }),
    },
  };
  const lotesService = {
    reponerStock: jest.fn(async (id: string, cantidad: number) => {
      state.lotes[id] += cantidad;
    }),
  };
  const service = new FacturasService(
    facturaRepository as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    lotesService as any,
  );
  return { service, state, manager, qb, lotesService, facturaRepository, factura };
}

describe('FacturasService.remove with detalles', () => {
  it('deletes the detalles and the factura and gives the units back to each lote', async () => {
    const detalles = [
      { id_detalle: 'd-1', cantidad: 2, id_lote: { id_lote: 'lote-1' } },
      { id_detalle: 'd-2', cantidad: 3, id_lote: { id_lote: 'lote-2' } },
      { id_detalle: 'd-3', cantidad: 1, id_lote: null },
    ];
    const { service, state, manager, qb, lotesService, factura } = buildService(detalles, { 'lote-1': 0, 'lote-2': 5 });

    await service.remove('7', 'emp-1');

    expect(manager.createQueryBuilder).toHaveBeenCalledWith(DetalleFactura, 'detalle');
    expect(qb.where).toHaveBeenCalledWith('detalle.id_factura = :idFactura', { idFactura: 7 });
    expect(lotesService.reponerStock).toHaveBeenCalledTimes(2);
    expect(lotesService.reponerStock).toHaveBeenCalledWith('lote-1', 2, 'emp-1', manager);
    expect(state.lotes).toEqual({ 'lote-1': 2, 'lote-2': 8 });
    expect(state.removed).toEqual([detalles, factura]);
  });

  it('deletes a factura without detalles', async () => {
    const { service, state, lotesService, factura } = buildService([], {});

    await service.remove('7', 'emp-1');

    expect(lotesService.reponerStock).not.toHaveBeenCalled();
    expect(state.removed).toEqual([[], factura]);
  });

  it('rolls the stock back when the factura cannot be deleted', async () => {
    const { service, state } = buildService(
      [{ id_detalle: 'd-1', cantidad: 2, id_lote: { id_lote: 'lote-1' } }],
      { 'lote-1': 0 },
      true,
    );

    await expect(service.remove('7', 'emp-1')).rejects.toThrow('db down');
    expect(state.lotes['lote-1']).toBe(0);
  });

  it('answers 404 without touching stock for a factura of another clinic', async () => {
    const { service, facturaRepository, lotesService } = buildService([], {});
    facturaRepository.findOne.mockResolvedValue(null as any);

    await expect(service.remove('7', 'emp-other')).rejects.toBeInstanceOf(NotFoundException);
    expect(facturaRepository.manager.transaction).not.toHaveBeenCalled();
    expect(lotesService.reponerStock).not.toHaveBeenCalled();
  });
});
