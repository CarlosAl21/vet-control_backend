import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ServiciosService } from './servicios.service';

describe('ServiciosService', () => {
  let service: ServiciosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServiciosService],
    }).compile();

    service = module.get<ServiciosService>(ServiciosService);
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

describe('ServiciosService relation ids', () => {
  it('create looks up the empresa by its plain string id', async () => {
    const servicioRepo = mockRepo();
    const empresaRepo = mockRepo();
    empresaRepo.findOne.mockResolvedValue({ id_empresa: 'emp-1' });
    const service = new ServiciosService(servicioRepo as any, empresaRepo as any);

    await service.create({ nombre: 'Baño', precio: 10, id_empresa: 'emp-1' } as any);

    expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id_empresa: 'emp-1' } });
    expect(servicioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_empresa: { id_empresa: 'emp-1' } }),
    );
  });

  it('create throws NotFoundException when the empresa does not exist', async () => {
    const empresaRepo = mockRepo();
    empresaRepo.findOne.mockResolvedValue(null);
    const service = new ServiciosService(mockRepo() as any, empresaRepo as any);

    await expect(
      service.create({ nombre: 'Baño', precio: 10, id_empresa: 'missing' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
