import { getMetadataArgsStorage } from 'typeorm';
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
    );

    await service.findAll('empresa-1');

    const { relations } = facturaRepository.find.mock.calls[0][0];
    const invalid = relations.filter((path: string) => !relationPathExists(Factura, path));
    expect(invalid).toEqual([]);
  });
});
