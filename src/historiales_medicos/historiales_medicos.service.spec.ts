import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HistorialesMedicosService } from './historiales_medicos.service';

describe('HistorialesMedicosService', () => {
  let service: HistorialesMedicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistorialesMedicosService],
    }).compile();

    service = module.get<HistorialesMedicosService>(HistorialesMedicosService);
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

describe('HistorialesMedicosService relation ids', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  const build = (historialRepo: any, mascotaRepo: any, empresaRepo: any) =>
    new HistorialesMedicosService(historialRepo, mockRepo() as any, {} as any, mascotaRepo, empresaRepo);

  it('create looks up mascota and empresa by plain string ids', async () => {
    const historialRepo = mockRepo();
    const mascotaRepo = mockRepo();
    const empresaRepo = mockRepo();
    mascotaRepo.findOne.mockResolvedValue({ id_mascota: 'm-1' });
    empresaRepo.findOne.mockResolvedValue({ id_empresa: 'e-1' });

    await build(historialRepo, mascotaRepo, empresaRepo).create({
      diagnostico: 'ok',
      id_mascota: 'm-1',
      id_empresa: 'e-1',
    } as any);

    expect(mascotaRepo.findOne).toHaveBeenCalledWith({ where: { id_mascota: 'm-1' } });
    expect(empresaRepo.findOne).toHaveBeenCalledWith({ where: { id_empresa: 'e-1' } });
    expect(historialRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_mascota: { id_mascota: 'm-1' }, id_empresa: { id_empresa: 'e-1' } }),
    );
  });

  it('create throws NotFoundException when the mascota does not exist', async () => {
    const mascotaRepo = mockRepo();
    mascotaRepo.findOne.mockResolvedValue(null);

    await expect(
      build(mockRepo(), mascotaRepo, mockRepo()).create({ id_mascota: 'x', id_empresa: 'e-1' } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
