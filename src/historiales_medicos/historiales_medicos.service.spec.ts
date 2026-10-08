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
