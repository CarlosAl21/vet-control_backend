import { Test, TestingModule } from '@nestjs/testing';
import { FirmantesController } from './firmantes.controller';
import { FirmantesService } from './firmantes.service';

describe('FirmantesController', () => {
  let controller: FirmantesController;
  const service = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const user = { userId: 'u-1', username: 'admin', rol: 'admin', empresaId: 'emp-1' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FirmantesController],
      providers: [{ provide: FirmantesService, useValue: service }],
    }).compile();

    controller = module.get<FirmantesController>(FirmantesController);
  });

  it('passes the JWT user to findAll', () => {
    controller.findAll(user);
    expect(service.findAll).toHaveBeenCalledWith(user);
  });

  it('passes the body and JWT user to create', () => {
    const dto = { nombre: 'A', puesto: 'B', orden: 0 };
    controller.create(dto, user);
    expect(service.create).toHaveBeenCalledWith(dto, user);
  });

  it('passes id, body and JWT user to update', () => {
    controller.update('f-1', { orden: 2 }, user);
    expect(service.update).toHaveBeenCalledWith('f-1', { orden: 2 }, user);
  });

  it('passes id and JWT user to remove', () => {
    controller.remove('f-1', user);
    expect(service.remove).toHaveBeenCalledWith('f-1', user);
  });
});
