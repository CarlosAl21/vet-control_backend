import { Test, TestingModule } from '@nestjs/testing';
import { FotosHistorialService } from './fotos_historial.service';

describe('FotosHistorialService', () => {
  let service: FotosHistorialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FotosHistorialService],
    }).compile();

    service = module.get<FotosHistorialService>(FotosHistorialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
