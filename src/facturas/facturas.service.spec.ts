import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Equal } from 'typeorm';
import { FacturasService } from './facturas.service';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn((data) => data),
  save: jest.fn(async (data) => data),
  merge: jest.fn((target, data) => Object.assign(target, data)),
  remove: jest.fn(async () => undefined),
});

const mockMail = () => ({ sendPaymentConfirmation: jest.fn(async () => undefined) });

const ownedFactura = () => ({
  id_factura: 7,
  total: 100,
  estado: 'pendiente',
  metodo_pago: 'Efectivo',
  cliente: { id_cliente: 'c-1', id_usuario: { email: 'a@b.c', nombre: 'Ana', apellido: 'Paz' } },
  id_empresa: { id_empresa: 'emp-1' },
});

describe('FacturasService clinic scope', () => {
  let facturaRepo: ReturnType<typeof mockRepo>;
  let clienteRepo: ReturnType<typeof mockRepo>;
  let mail: ReturnType<typeof mockMail>;
  let service: FacturasService;

  beforeEach(() => {
    facturaRepo = mockRepo();
    clienteRepo = mockRepo();
    mail = mockMail();
    service = new FacturasService(
      facturaRepo as any,
      clienteRepo as any,
      mockRepo() as any,
      mail as any,
      mockRepo() as any,
    );
  });

  describe('create', () => {
    it('uses the JWT empresa and ignores a body id_empresa', async () => {
      clienteRepo.findOne.mockResolvedValue({ id_cliente: 'c-1' });

      await service.create(
        { total: 10, id_cliente: 'c-1', id_empresa: { id_empresa: 'emp-other' } } as any,
        'emp-1',
      );

      const created = facturaRepo.create.mock.calls[0][0];
      expect(created.id_empresa).toEqual({ id_empresa: 'emp-1' });
      expect(created.cliente).toEqual({ id_cliente: 'c-1' });
      expect(created).not.toHaveProperty('id_cliente');
      expect(facturaRepo.save).toHaveBeenCalled();
    });

    it('scopes the cliente lookup to the JWT empresa', async () => {
      clienteRepo.findOne.mockResolvedValue({ id_cliente: 'c-1' });

      await service.create({ total: 10, id_cliente: 'c-1' } as any, 'emp-1');

      expect(clienteRepo.findOne).toHaveBeenCalledWith({
        where: { id_cliente: Equal('c-1'), id_empresa: Equal('emp-1') },
      });
    });

    it('throws ForbiddenException when the user has no empresa', async () => {
      await expect(
        service.create({ total: 10, id_cliente: 'c-1' } as any, null),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(facturaRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the cliente belongs to another clinic', async () => {
      clienteRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create({ total: 10, id_cliente: 'c-foreign' } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(facturaRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('looks up by id and the JWT empresa', async () => {
      facturaRepo.findOne.mockResolvedValue(ownedFactura());

      await service.findOne('7', 'emp-1');

      expect(facturaRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_factura: 7, id_empresa: Equal('emp-1') } }),
      );
    });

    it('throws NotFoundException for a factura of another clinic', async () => {
      facturaRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('7', 'emp-other')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws NotFoundException (not a TypeError) when the factura is missing', async () => {
      facturaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(99, { estado: 'pagado' } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(facturaRepo.save).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a factura of another clinic', async () => {
      facturaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(7, { total: 1 } as any, 'emp-other'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(facturaRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id_factura: 7, id_empresa: Equal('emp-other') } }),
      );
    });

    it('cannot move the factura to another clinic via the body', async () => {
      facturaRepo.findOne.mockResolvedValue(ownedFactura());

      const saved = await service.update(
        7,
        { total: 5, id_empresa: { id_empresa: 'emp-other' } } as any,
        'emp-1',
      );

      expect(saved.id_empresa).toEqual({ id_empresa: 'emp-1' });
      expect(saved.total).toBe(5);
    });

    it('rejects reassigning the cliente to one from another clinic', async () => {
      facturaRepo.findOne.mockResolvedValue(ownedFactura());
      clienteRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(7, { id_cliente: 'c-foreign' } as any, 'emp-1'),
      ).rejects.toBeInstanceOf(NotFoundException);
      expect(clienteRepo.findOne).toHaveBeenCalledWith({
        where: { id_cliente: Equal('c-foreign'), id_empresa: Equal('emp-1') },
      });
      expect(facturaRepo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('throws NotFoundException for a factura of another clinic', async () => {
      facturaRepo.findOne.mockResolvedValue(null);

      await expect(service.remove('7', 'emp-other')).rejects.toBeInstanceOf(NotFoundException);
      expect(facturaRepo.remove).not.toHaveBeenCalled();
    });

    it('removes an owned factura', async () => {
      facturaRepo.findOne.mockResolvedValue(ownedFactura());

      await service.remove('7', 'emp-1');

      expect(facturaRepo.remove).toHaveBeenCalled();
    });
  });

  describe('findByEmpresa', () => {
    it('throws NotFoundException when the URL empresa differs from the JWT empresa', async () => {
      await expect(service.findByEmpresa('emp-other', 'emp-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(facturaRepo.find).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the user has no empresa', async () => {
      await expect(service.findByEmpresa('emp-1', null)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('returns the facturas of the JWT empresa', async () => {
      facturaRepo.find.mockResolvedValue([ownedFactura()]);

      const result = await service.findByEmpresa('emp-1', 'emp-1');

      expect(facturaRepo.find).toHaveBeenCalledWith({ where: { id_empresa: Equal('emp-1') } });
      expect(result).toHaveLength(1);
    });
  });

  describe('markPaid', () => {
    it('sets the estado to pagado and sends the payment confirmation', async () => {
      facturaRepo.findOne.mockResolvedValue(ownedFactura());

      const saved = await service.markPaid(7, 'Stripe');

      expect(saved?.estado).toBe('pagado');
      expect(saved?.metodo_pago).toBe('Stripe');
      expect(mail.sendPaymentConfirmation).toHaveBeenCalledWith('a@b.c', {
        name: 'Ana Paz',
        amount: 100,
        paymentId: 7,
      });
    });

    it('returns null without throwing when the factura does not exist', async () => {
      facturaRepo.findOne.mockResolvedValue(null);

      await expect(service.markPaid(99)).resolves.toBeNull();
      expect(facturaRepo.save).not.toHaveBeenCalled();
    });
  });
});
