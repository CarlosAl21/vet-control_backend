import { MascotasService } from './mascotas.service';

function buildService() {
  const queryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  };
  const mascotaRepository = { createQueryBuilder: jest.fn().mockReturnValue(queryBuilder) };
  const service = new MascotasService(mascotaRepository as any, {} as any);
  return { service, queryBuilder };
}

describe('MascotasService.findAll', () => {
  it('filters mascotas through the owner cliente of the caller clinic', async () => {
    const { service, queryBuilder } = buildService();

    await service.findAll('emp-1');

    expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('mascota.id_usuario', 'usuario');
    expect(queryBuilder.innerJoin).toHaveBeenCalledWith('usuario.clientes', 'cliente', 'cliente.id_empresa = :empresaId', { empresaId: 'emp-1' });
    expect(queryBuilder.where).not.toHaveBeenCalledWith('usuario.id_empresa = :empresaId', expect.anything());
    expect(queryBuilder.getMany).toHaveBeenCalled();
  });
});
