import { NotFoundException } from '@nestjs/common';
import { Equal, getMetadataArgsStorage } from 'typeorm';
import { FacturasService } from './facturas.service';
import { Factura } from './entities/factura.entity';

function relationPathExists(entity: Function, path: string): boolean {
  let target = entity;
  for (const property of path.split('.')) {
    const relation = getMetadataArgsStorage().relations.find(
      (r) => r.target === target && r.propertyName === property,
    );
    if (!relation) return false;
    target = (relation.type as () => Function)();
  }
  return true;
}

describe('FacturasService relations', () => {
  it('findAll only loads relations defined on Factura', async () => {
    const facturaRepository = { find: jest.fn().mockResolvedValue([]) };
    const service = new FacturasService(
      facturaRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAll('empresa-1');

    const { relations } = facturaRepository.find.mock.calls[0][0];
    const invalid = relations.filter((path: string) => !relationPathExists(Factura, path));
    expect(invalid).toEqual([]);
  });

  it('findAll loads the lote of each detalle (null for a detalle without lote)', async () => {
    const facturaRepository = { find: jest.fn().mockResolvedValue([]) };
    const service = new FacturasService(
      facturaRepository as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
      {} as any,
    );

    await service.findAll('empresa-1');

    const { relations, where } = facturaRepository.find.mock.calls[0][0];
    expect(relations).toEqual(expect.arrayContaining(['detalles', 'detalles.id_lote']));
    expect(where.id_empresa).toEqual(Equal('empresa-1'));
    // detalle.id_lote is a nullable ManyToOne: TypeORM yields null when the FK is null.
    expect(relationPathExists(Factura, 'detalles.id_lote')).toBe(true);
  });

  it('findByUserId loads the lote of each detalle', async () => {
    const facturaRepository = { find: jest.fn().mockResolvedValue([{ id_factura: 1 }]) };
    const usuarioRepository = { findOne: jest.fn().mockResolvedValue({ clientes: [{ id_cliente: 'c-1' }] }) };
    const service = new FacturasService(
      facturaRepository as any,
      {} as any,
      {} as any,
      {} as any,
      usuarioRepository as any,
      {} as any,
    );

    await service.findByUserId('u-1', { userId: 'u-9', rol: 'admin', empresaId: 'empresa-1' });

    const { relations, where } = facturaRepository.find.mock.calls[0][0];
    expect(relations).toContain('detalles.id_lote');
    expect(relations.filter((path: string) => !relationPathExists(Factura, path))).toEqual([]);
    expect(where.id_empresa).toEqual(Equal('empresa-1'));
  });

  describe('findByEmpresa', () => {
    const build = () => {
      const facturaRepository = { find: jest.fn().mockResolvedValue([]) };
      const service = new FacturasService(
        facturaRepository as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
        {} as any,
      );
      return { facturaRepository, service };
    };

    it('loads only detalles and the lote of each detalle, scoped to the JWT empresa', async () => {
      const { facturaRepository, service } = build();

      await service.findByEmpresa('empresa-1', 'empresa-1');

      const { relations, where } = facturaRepository.find.mock.calls[0][0];
      expect(relations).toEqual(['detalles', 'detalles.id_lote']);
      expect(relations.filter((path: string) => !relationPathExists(Factura, path))).toEqual([]);
      expect(where).toEqual({ id_empresa: Equal('empresa-1') });
    });

    it('answers 404 without querying for another clinic or a user without empresa', async () => {
      const { facturaRepository, service } = build();

      await expect(service.findByEmpresa('empresa-2', 'empresa-1')).rejects.toBeInstanceOf(NotFoundException);
      await expect(service.findByEmpresa('empresa-1', null)).rejects.toBeInstanceOf(NotFoundException);
      expect(facturaRepository.find).not.toHaveBeenCalled();
    });
  });
});
