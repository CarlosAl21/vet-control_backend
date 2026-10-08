import { Test, TestingModule } from '@nestjs/testing';
import { HistorialesMedicosController } from './historiales_medicos.controller';
import { HistorialesMedicosService } from './historiales_medicos.service';

describe('HistorialesMedicosController', () => {
  let controller: HistorialesMedicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialesMedicosController],
      providers: [HistorialesMedicosService],
    }).compile();

    controller = module.get<HistorialesMedicosController>(HistorialesMedicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
