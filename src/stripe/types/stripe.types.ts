// Tipos TypeScript para el servicio de Stripe

export interface PaymentSheetParams {
  paymentIntent: string;
  ephemeralKey: string;
  customer: string;
  publishableKey: string;
}

export interface CreatePaymentSheetDto {
  amount: number;
  currency: string;
  customerEmail?: string;
  customerId?: string;
}

export interface CreatePaymentIntentDto {
  amount: number;
  currency: string;
}

export interface CreateCheckoutSessionDto {
  amount: number;
  currency: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCustomerDto {
  email: string;
  name?: string;
  phone?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

export interface CustomerResponse {
  customerId: string;
  email: string;
  name?: string;
}

export interface PaymentIntentInfo {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, string>;
}

export interface WebhookResponse {
  received: boolean;
}

// Tipos para metadatos personalizados
export interface PaymentMetadata {
  source: string;
  platform?: string;
  customerEmail?: string;
  timestamp: string;
  [key: string]: string | undefined;
}

// Configuración de Stripe
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret?: string;
  apiVersion: string;
}
