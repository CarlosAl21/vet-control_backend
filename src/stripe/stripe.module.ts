import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { FacturasModule } from 'src/facturas/facturas.module';

@Module({
  imports: [FacturasModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
