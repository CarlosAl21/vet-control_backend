import { Test, TestingModule } from '@nestjs/testing';
import { DetalleHistorialController } from './detalle_historial.controller';
import { DetalleHistorialService } from './detalle_historial.service';

describe('DetalleHistorialController', () => {
  let controller: DetalleHistorialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleHistorialController],
      providers: [DetalleHistorialService],
    }).compile();

    controller = module.get<DetalleHistorialController>(DetalleHistorialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
