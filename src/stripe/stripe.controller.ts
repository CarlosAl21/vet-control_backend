import { Controller, Post, Body, InternalServerErrorException, Get, Param, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { Request } from 'express';
import { 
  PaymentSheetParams, 
  CreatePaymentSheetDto, 
  CreatePaymentIntentDto, 
  CreateCheckoutSessionDto
} from './types/stripe.types';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  // Endpoint principal para Payment Sheet (Expo/React Native)
  @Post('payment-sheet')
  async createPaymentSheet(@Body() createPaymentSheetDto: CreatePaymentSheetDto): Promise<PaymentSheetParams> {
    const { amount, currency, customerEmail, customerId } = createPaymentSheetDto;

    // Validación de los parámetros requeridos
    if (!amount || !currency) {
      throw new InternalServerErrorException('Faltan parámetros requeridos: amount y currency');
    }

    if (amount <= 0) {
      throw new InternalServerErrorException('El monto debe ser mayor a 0');
    }

    try {
      return await this.stripeService.createPaymentSheet(amount, currency, customerEmail, customerId);
    } catch (error) {
      console.error('Error creando Payment Sheet:', error);
      throw new InternalServerErrorException('Error al crear el Payment Sheet');
    }
  }

  // Endpoint legacy para Payment Intent (compatibilidad)
  @Post('create-payment-intent')
  async createPaymentIntent(@Body() createPaymentDto: CreatePaymentIntentDto) {
    const { amount, currency } = createPaymentDto;

    // Validación de los parámetros requeridos
    if (!amount || !currency) {
      return { error: 'Faltan parámetros requeridos.' };
    }

    try {
      const paymentIntent = await this.stripeService.createPaymentIntent(amount, currency);
      return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
      console.error('Error creando el Payment Intent:', error);
      return { error: 'Error al crear el Payment Intent' };
    }
  }

  // Endpoint para Checkout Session (Web)
  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: CreateCheckoutSessionDto) {
    try {
      const session = await this.stripeService.createCheckoutSession(body);
      return { 
        sessionId: session.id,
        url: session.url 
      };
    } catch (error) {
      console.error('Error creando la sesión:', error);
      throw new InternalServerErrorException('No se pudo crear la sesión de Stripe.');
    }
  }

  // Endpoint para obtener información de un pago
  @Get('payment-intent/:id')
  async getPaymentIntent(@Param('id') paymentIntentId: string) {
    try {
      const paymentIntent = await this.stripeService.getPaymentIntent(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Error obteniendo payment intent:', error);
      throw new InternalServerErrorException('No se pudo obtener la información del pago');
    }
  }

  // Endpoint para crear un customer
  @Post('create-customer')
  async createCustomer(@Body() body: { email: string; name?: string; phone?: string }) {
    const { email, name, phone } = body;

    if (!email) {
      throw new InternalServerErrorException('El email es requerido');
    }

    try {
      const customer = await this.stripeService.createCustomer(email, name, phone);
      return {
        customerId: customer.id,
        email: customer.email,
        name: customer.name,
      };
    } catch (error) {
      console.error('Error creando customer:', error);
      throw new InternalServerErrorException('No se pudo crear el customer');
    }
  }

  // Webhook endpoint para eventos de Stripe
  @Post('webhook')
  async handleWebhook(@Req() req: RawBodyRequest<Request>, @Headers('stripe-signature') signature: string) {
    try {
      const event = this.stripeService.validateWebhook(req.rawBody, signature);
      
      // Procesar diferentes tipos de eventos
      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('Payment succeeded:', event.data.object);
          // Aquí puedes agregar lógica para manejar pagos exitosos
          break;
        case 'payment_intent.payment_failed':
          console.log('Payment failed:', event.data.object);
          // Aquí puedes agregar lógica para manejar pagos fallidos
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      console.error('Error procesando webhook:', error);
      throw new InternalServerErrorException('Error procesando webhook');
    }
  }
}
