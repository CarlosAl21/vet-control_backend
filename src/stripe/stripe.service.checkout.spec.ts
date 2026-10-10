import { StripeService } from './stripe.service';
import { FacturasService } from 'src/facturas/facturas.service';

describe('StripeService.createCheckoutSession redirect URLs', () => {
  const originalFrontendUrl = process.env.FRONTEND_URL;
  let service: StripeService;
  let createSession: jest.Mock;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
    service = new StripeService({} as FacturasService);
    createSession = jest.fn().mockResolvedValue({ id: 'cs_test' });
    (service as any).stripe = { checkout: { sessions: { create: createSession } } };
  });

  afterEach(() => {
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
  });

  const baseBody = { amount: 1000, currency: 'mxn' };

  it('uses successUrl and cancelUrl from the body when provided', async () => {
    process.env.FRONTEND_URL = 'https://front.example.com';

    await service.createCheckoutSession({
      ...baseBody,
      successUrl: 'https://custom.example.com/ok',
      cancelUrl: 'https://custom.example.com/ko',
    });

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'https://custom.example.com/ok',
        cancel_url: 'https://custom.example.com/ko',
      }),
    );
  });

  it('falls back to FRONTEND_URL when the body has no URLs', async () => {
    process.env.FRONTEND_URL = 'https://front.example.com';

    await service.createCheckoutSession(baseBody);

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'https://front.example.com/success',
        cancel_url: 'https://front.example.com/cancel',
      }),
    );
  });

  it('falls back to localhost when neither body URLs nor FRONTEND_URL are set', async () => {
    delete process.env.FRONTEND_URL;

    await service.createCheckoutSession(baseBody);

    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/cancel',
      }),
    );
  });
});
