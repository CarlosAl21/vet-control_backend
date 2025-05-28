import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  async createPaymentIntent(amount: number, currency: string) {
    return this.stripe.paymentIntents.create({
      amount,
      currency,
    });
  }

  async createCheckoutSession(body: { amount: number; currency: string }) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: body.currency,
              product_data: { name: 'Pago de chequeo' },
              unit_amount: body.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: 'http://localhost:4200/success',
        cancel_url: 'http://localhost:4200/cancel',
      });
      return session;
    } catch (error) {
      console.error('Error al crear la sesión de Stripe:', error);
      throw new InternalServerErrorException('No se pudo crear la sesión de pago');
    }
  }
}
