import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FacturasService } from './facturas.service';

describe('FacturasService', () => {
  let service: FacturasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FacturasService],
    }).compile();

    service = module.get<FacturasService>(FacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn(async (data) => data),
  merge: jest.fn((target, data) => Object.assign(target, data)),
});

describe('FacturasService relation ids', () => {
  const build = (clienteRepo: ReturnType<typeof mockRepo>, facturaRepo = mockRepo()) =>
    new FacturasService(facturaRepo as any, clienteRepo as any, mockRepo() as any, {} as any, mockRepo() as any);

  it('create looks up the cliente by its plain string id', async () => {
    const facturaRepo = mockRepo();
    const clienteRepo = mockRepo();
    clienteRepo.findOne.mockResolvedValue({ id_cliente: 'c-1' });

    await build(clienteRepo, facturaRepo).create({ total: 10, id_cliente: 'c-1' } as any);

    expect(clienteRepo.findOne).toHaveBeenCalledWith({ where: { id_cliente: 'c-1' } });
    const created = facturaRepo.create.mock.calls[0][0];
    expect(created.cliente).toEqual({ id_cliente: 'c-1' });
    expect(created).not.toHaveProperty('id_cliente');
  });

  it('create throws NotFoundException when the cliente does not exist', async () => {
    const clienteRepo = mockRepo();
    clienteRepo.findOne.mockResolvedValue(null);

    await expect(
      build(clienteRepo).create({ total: 10, id_cliente: 'missing' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
