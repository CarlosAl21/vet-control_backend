import { StripeService } from './stripe.service';
import { FacturasService } from 'src/facturas/facturas.service';

describe('StripeService webhook handlers', () => {
  let facturas: { markPaid: jest.Mock; update: jest.Mock };
  let service: StripeService;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    facturas = { markPaid: jest.fn(async () => null), update: jest.fn() };
    service = new StripeService(facturas as unknown as FacturasService);
  });

  it('marks the invoice as paid through the system path on payment_intent.succeeded', async () => {
    await service.handlePaymentSucceeded({ metadata: { invoiceId: '12' } } as any);

    expect(facturas.markPaid).toHaveBeenCalledWith(12, 'Stripe');
    expect(facturas.update).not.toHaveBeenCalled();
  });

  it('marks the invoice as paid through the system path on checkout.session.completed', async () => {
    await service.handleCheckoutCompleted({ metadata: { invoiceId: '12' } } as any);

    expect(facturas.markPaid).toHaveBeenCalledWith(12, 'Stripe');
    expect(facturas.update).not.toHaveBeenCalled();
  });

  it('ignores events without a numeric invoiceId', async () => {
    await service.handlePaymentSucceeded({ metadata: {} } as any);
    await service.handleCheckoutCompleted({ metadata: { invoiceId: 'abc' } } as any);

    expect(facturas.markPaid).not.toHaveBeenCalled();
  });
});
