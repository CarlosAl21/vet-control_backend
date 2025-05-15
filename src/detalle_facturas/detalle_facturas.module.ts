import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleFactura } from './entities/detalle_factura.entity';
import { DetalleFacturaController } from './detalle_facturas.controller';
import { DetalleFacturaService } from './detalle_facturas.service';
import { LotesModule } from 'src/lotes/lotes.module';
import { Lote } from 'src/lotes/entities/lote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleFactura, Lote]), LotesModule],
  controllers: [DetalleFacturaController],
  providers: [DetalleFacturaService],
  exports: [DetalleFacturaService],
})
export class DetalleFacturaModule {}
