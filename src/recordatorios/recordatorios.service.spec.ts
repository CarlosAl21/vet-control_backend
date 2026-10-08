import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RecordatoriosService } from './recordatorios.service';

describe('RecordatoriosService', () => {
  let service: RecordatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecordatoriosService],
    }).compile();

    service = module.get<RecordatoriosService>(RecordatoriosService);
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

describe('RecordatoriosService relation ids', () => {
  it('create looks up the mascota by its plain string id', async () => {
    const recordatorioRepo = mockRepo();
    const mascotaRepo = mockRepo();
    mascotaRepo.findOne.mockResolvedValue({ id_mascota: 'm-1' });
    const service = new RecordatoriosService(recordatorioRepo as any, mascotaRepo as any);

    await service.create({ id_mascota: 'm-1' } as any);

    expect(mascotaRepo.findOne).toHaveBeenCalledWith({ where: { id_mascota: 'm-1' } });
    expect(recordatorioRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_mascota: { id_mascota: 'm-1' } }),
    );
  });

  it('create throws NotFoundException when the mascota does not exist', async () => {
    const mascotaRepo = mockRepo();
    mascotaRepo.findOne.mockResolvedValue(null);
    const service = new RecordatoriosService(mockRepo() as any, mascotaRepo as any);

    await expect(service.create({ id_mascota: 'missing' } as any)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
