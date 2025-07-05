import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendReservationConfirmation(email: string, reservationData: any) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Confirmación de Reserva',
        template: './confirmation',
        context: {
          name: reservationData.name,
          reservationId: reservationData.reservationId,
        },
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendPaymentConfirmation(email: string, paymentData: any) {
    try {
      await this.mailerService.sendMail({
      to: email,
      subject: 'Confirmación de Pago',
      template: './payment',
      context: {
        name: paymentData.name,
        amount: paymentData.amount,
        paymentId: paymentData.paymentId,
      },
    });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }

  async sendPaymentRejected(email: string, rejectionData: any) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Comprobante de Pago Rechazado',
        template: './payment-rejected',
        context: {
          name: rejectionData.name,
          reason: rejectionData.reason || 'No se proporcionó un motivo específico',
          reservationId: rejectionData.reservationId,
          ticketId: rejectionData.ticketId,
        },
      });
    } catch (error) {
      console.error('Error sending payment rejection email:', error);
    }
  }

  async sendWelcomeWithTempPassword(email: string, data: { contraseña: string }) {
    try {
      const result = await this.mailerService.sendMail({
        to: email,
        subject: 'Bienvenido - Acceso a tu cuenta',
        template: './welcome', // Debes tener este template en src/mail/templates/welcome.hbs
        context: {
          email: email,
          contraseña: data.contraseña,
          mensaje: 'Por favor, inicia sesión y cambia tu contraseña temporal.',
        },
      });
      return result; // O return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  async sendPasswordReset(email: string, data: { token: string }) {
  try {
    const resetUrl = `https://vet-control-tau.vercel.app/reset-password?token=${data.token}`;
    const result = await this.mailerService.sendMail({
      to: email,
      subject: 'Restablecimiento de Contraseña',
      template: './password-reset',
      context: {
        email: email,
        token: data.token,
        resetUrl,
        mensaje: 'Haz clic en el enlace para restablecer tu contraseña.',
      },
    });
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
}