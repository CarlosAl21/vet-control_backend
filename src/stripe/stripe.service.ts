import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Stripe from 'stripe';
import { PaymentSheetParams } from './types/stripe.types';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil', // Usar la versión compatible
    });
  }

  // Método principal para Payment Sheet - Compatible con Web y Expo
  async createPaymentSheet(
    amount: number,
    currency: string,
    customerEmail?: string,
    customerId?: string,
  ): Promise<PaymentSheetParams> {
    try {
      // 1. Crear o recuperar el Customer
      let customer: Stripe.Customer;
      
      if (customerId) {
        // Si se proporciona customerId, recuperarlo
        customer = await this.stripe.customers.retrieve(customerId) as Stripe.Customer;
      } else if (customerEmail) {
        // Buscar customer existente por email
        const existingCustomers = await this.stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });

        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          // Crear nuevo customer
          customer = await this.stripe.customers.create({
            email: customerEmail,
          });
        }
      } else {
        // Crear customer temporal para la sesión
        customer = await this.stripe.customers.create();
      }

      // 2. Crear Ephemeral Key
      const ephemeralKey = await this.stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: '2025-04-30.basil' }
      );

      // 3. Crear PaymentIntent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          source: 'VetControl App',
          customerEmail: customerEmail || 'guest',
          timestamp: new Date().toISOString(),
        },
      });

      // 4. Retornar todos los datos necesarios
      return {
        paymentIntent: paymentIntent.client_secret || '',
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLIC_KEY || '',
      };
    } catch (error) {
      console.error('Error al crear Payment Sheet:', error);
      throw new InternalServerErrorException('No se pudo crear el payment sheet');
    }
  }

  // Método legacy para compatibilidad - Solo PaymentIntent
  async createPaymentIntent(amount: number, currency: string) {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          source: 'VetControl Web',
          platform: 'web'
        }
      });
    } catch (error) {
      console.error('Error al crear Payment Intent:', error);
      throw new InternalServerErrorException('No se pudo crear el payment intent');
    }
  }

  // Método alternativo con customer (recomendado para producción)
  async createPaymentIntentWithCustomer(
    amount: number, 
    currency: string, 
    customerEmail?: string
  ) {
    try {
      let customerId: string | undefined;

      // Crear o encontrar customer si se proporciona email
      if (customerEmail) {
        const customers = await this.stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });

        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        } else {
          const customer = await this.stripe.customers.create({
            email: customerEmail,
          });
          customerId = customer.id;
        }
      }

      return await this.stripe.paymentIntents.create({
        amount,
        currency,
        customer: customerId,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          source: 'VetControl Mobile App',
          platform: 'react-native',
          customerEmail: customerEmail || 'guest'
        }
      });
    } catch (error) {
      console.error('Error al crear Payment Intent con customer:', error);
      throw new InternalServerErrorException('No se pudo crear el payment intent');
    }
  }

  // Método específico para aplicaciones web - Checkout Session
  async createCheckoutSession(body: { amount: number; currency: string; successUrl?: string; cancelUrl?: string }) {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: body.currency,
              product_data: { name: 'Pago VetControl' },
              unit_amount: body.amount,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: body.successUrl || 'http://localhost:4200/success',
        cancel_url: body.cancelUrl || 'http://localhost:4200/cancel',
        metadata: {
          source: 'VetControl Web',
          platform: 'web',
          timestamp: new Date().toISOString(),
        },
      });
      return session;
    } catch (error) {
      console.error('Error al crear la sesión de Stripe:', error);
      throw new InternalServerErrorException('No se pudo crear la sesión de pago');
    }
  }

  // Método para validar webhook de Stripe
  validateWebhook(payload: Buffer, signature: string): Stripe.Event {
    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET no está configurado');
      }
      
      return this.stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } catch (error) {
      console.error('Error validando webhook:', error);
      throw new InternalServerErrorException('Webhook inválido');
    }
  }

  // Método para confirmar el pago (útil para casos especiales)
  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      console.error('Error confirmando payment intent:', error);
      throw new InternalServerErrorException('No se pudo confirmar el pago');
    }
  }

  // Método para obtener información de un pago
  async getPaymentIntent(paymentIntentId: string) {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      console.error('Error obteniendo payment intent:', error);
      throw new InternalServerErrorException('No se pudo obtener la información del pago');
    }
  }

  // Método para crear un customer permanente
  async createCustomer(email: string, name?: string, phone?: string) {
    try {
      return await this.stripe.customers.create({
        email,
        name,
        phone,
        metadata: {
          source: 'VetControl',
          createdAt: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error('Error creando customer:', error);
      throw new InternalServerErrorException('No se pudo crear el customer');
    }
  }
}
