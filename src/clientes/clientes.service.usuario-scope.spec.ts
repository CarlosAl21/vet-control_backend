import { NotFoundException } from '@nestjs/common';
import { ClientesService } from './clientes.service';

const clientes = () => [
  { id_cliente: 'c-1', id_empresa: { id_empresa: 'emp-1' } },
  { id_cliente: 'c-2', id_empresa: { id_empresa: 'emp-2' } },
];

function buildService(usuario: unknown) {
  const findOne = jest.fn().mockResolvedValue(usuario);
  const service = new ClientesService({} as any, { findOne } as any, {} as any, {} as any);
  return { service, findOne };
}

describe('ClientesService.FindByUserId access', () => {
  it('returns every clinic of the user to the user themself', async () => {
    const { service } = buildService({ clientes: clientes() });

    const result = await service.FindByUserId('u-1', { userId: 'u-1', rol: 'usuario', empresaId: null });

    expect(result).toHaveLength(2);
  });

  it('limits staff to the clientes of their own clinic', async () => {
    const { service } = buildService({ clientes: clientes() });

    const result = await service.FindByUserId('u-1', { userId: 'u-9', rol: 'recepcionista', empresaId: 'emp-1' });

    expect(result).toEqual([clientes()[0]]);
  });

  it('answers 404 to another usuario without querying', async () => {
    const { service, findOne } = buildService({ clientes: clientes() });

    await expect(
      service.FindByUserId('u-1', { userId: 'u-2', rol: 'usuario', empresaId: null }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findOne).not.toHaveBeenCalled();
  });
});
