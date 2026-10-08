import { Test, TestingModule } from '@nestjs/testing';
import { DetalleFacturasService } from './detalle_facturas.service';

describe('DetalleFacturasService', () => {
  let service: DetalleFacturasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleFacturasService],
    }).compile();

    service = module.get<DetalleFacturasService>(DetalleFacturasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
