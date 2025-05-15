import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleFactura } from './entities/detalle_factura.entity';
import { DetalleFacturaController } from './detalle_facturas.controller';
import { DetalleFacturaService } from './detalle_facturas.service';
import { LotesModule } from 'src/lotes/lotes.module';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleFactura]), LotesModule],
  controllers: [DetalleFacturaController],
  providers: [DetalleFacturaService],
  exports: [TypeOrmModule, DetalleFacturaService],
})
export class DetalleFacturaModule {}
