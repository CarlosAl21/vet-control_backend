import { Test, TestingModule } from '@nestjs/testing';
import { FotosHistorialController } from './fotos_historial.controller';
import { FotosHistorialService } from './fotos_historial.service';

describe('FotosHistorialController', () => {
  let controller: FotosHistorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FotosHistorialController],
      providers: [FotosHistorialService],
    }).compile();

    controller = module.get<FotosHistorialController>(FotosHistorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
