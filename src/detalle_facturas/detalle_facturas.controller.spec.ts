import { Test, TestingModule } from '@nestjs/testing';
import { DetalleFacturasController } from './detalle_facturas.controller';
import { DetalleFacturasService } from './detalle_facturas.service';

describe('DetalleFacturasController', () => {
  let controller: DetalleFacturasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetalleFacturasController],
      providers: [DetalleFacturasService],
    }).compile();

    controller = module.get<DetalleFacturasController>(DetalleFacturasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
