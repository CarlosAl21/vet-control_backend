import { Test, TestingModule } from '@nestjs/testing';
import { DetalleHistorialService } from './detalle_historial.service';

describe('DetalleHistorialService', () => {
  let service: DetalleHistorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleHistorialService],
    }).compile();

    service = module.get<DetalleHistorialService>(DetalleHistorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
