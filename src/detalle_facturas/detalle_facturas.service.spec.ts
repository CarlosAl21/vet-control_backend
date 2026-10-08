import { DetalleFacturaService } from './detalle_facturas.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('DetalleFacturaService', () => {
  let service: DetalleFacturaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DetalleFacturaService],
    }).compile();

    service = module.get<DetalleFacturaService>(DetalleFacturaService);
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

describe('DetalleFacturaService relation ids', () => {
  it('create reads id_lote as a plain string', async () => {
    const detalleRepo = mockRepo();
    const lotesRepo = mockRepo();
    lotesRepo.findOne.mockResolvedValue({ id_lote: 'l-1', estado: 'disponible' });
    const lotesService = { descontarStock: jest.fn() };
    const service = new DetalleFacturaService(detalleRepo as any, lotesRepo as any, lotesService as any);

    await service.create({ cantidad: 2, precio_unitario: 5, id_lote: 'l-1', id_factura: { id_factura: 1 } } as any);

    expect(lotesRepo.findOne).toHaveBeenCalledWith({ where: { id_lote: 'l-1' } });
    expect(lotesService.descontarStock).toHaveBeenCalledWith('l-1', 2);
    expect(detalleRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ id_lote: { id_lote: 'l-1' }, subtotal: 10 }),
    );
  });
});
