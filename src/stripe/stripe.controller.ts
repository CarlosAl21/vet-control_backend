import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { StripeService } from './stripe.service';

@Controller('stripe') // Esta es la ruta base del controlador
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-payment-intent') // Ruta para Payment Intent
  async createPaymentIntent(@Body() createPaymentDto: { amount: number; currency: string }) {
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

  @Post('create-checkout-session') // Nueva ruta para Checkout Session
  async createCheckoutSession(@Body() body: { amount: number; currency: string }) {
    try {
      const session = await this.stripeService.createCheckoutSession(body);
      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creando la sesión:', error);
      throw new InternalServerErrorException('No se pudo crear la sesión de Stripe.');
    }
  }
}
