import { getMetadataArgsStorage } from 'typeorm';
import { ClientesService } from './clientes.service';
import { Cliente } from './entities/cliente.entity';

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

function buildService(findOne: jest.Mock) {
  return new ClientesService(
    { findOne } as any,
    {} as any,
    {} as any,
    {} as any,
  );
}

describe('ClientesService.obtenerMascotasPorCliente', () => {
  it('only loads relations defined on Cliente', async () => {
    const findOne = jest.fn().mockResolvedValue({ id_usuario: { mascotas: [] } });

    await buildService(findOne).obtenerMascotasPorCliente('cliente-1');

    const { relations } = findOne.mock.calls[0][0];
    const invalid = relations.filter((path: string) => !relationPathExists(Cliente, path));
    expect(invalid).toEqual([]);
  });

  it('returns the mascotas of the linked usuario', async () => {
    const mascotas = [{ id_mascota: 'm-1' }];
    const findOne = jest.fn().mockResolvedValue({ id_usuario: { mascotas } });

    await expect(buildService(findOne).obtenerMascotasPorCliente('cliente-1')).resolves.toBe(mascotas);
  });

  it('returns an empty list when the cliente has no usuario', async () => {
    const findOne = jest.fn().mockResolvedValue({ id_usuario: null });

    await expect(buildService(findOne).obtenerMascotasPorCliente('cliente-1')).resolves.toEqual([]);
  });
});
