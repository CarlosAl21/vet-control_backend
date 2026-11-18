import { NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { FacturasService } from './facturas.service';

function buildService() {
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
  return { service, facturaRepository, usuarioRepository };
}

describe('FacturasService.findByUserId access', () => {
  it('does not scope the facturas of the user themself to a clinic', async () => {
    const { service, facturaRepository } = buildService();

    await service.findByUserId('u-1', { userId: 'u-1', rol: 'usuario', empresaId: null });

    const { where } = facturaRepository.find.mock.calls[0][0];
    expect(where).not.toHaveProperty('id_empresa');
  });

  it('limits staff to the facturas of their own clinic', async () => {
    const { service, facturaRepository } = buildService();

    await service.findByUserId('u-1', { userId: 'u-9', rol: 'admin', empresaId: 'emp-1' });

    const { where } = facturaRepository.find.mock.calls[0][0];
    expect(where.id_empresa).toEqual(Equal('emp-1'));
  });

  it('answers 404 to another usuario without querying', async () => {
    const { service, usuarioRepository, facturaRepository } = buildService();

    await expect(
      service.findByUserId('u-1', { userId: 'u-2', rol: 'usuario', empresaId: null }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(usuarioRepository.findOne).not.toHaveBeenCalled();
    expect(facturaRepository.find).not.toHaveBeenCalled();
  });
});
