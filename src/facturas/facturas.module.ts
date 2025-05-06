import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Cliente])],
  controllers: [FacturasController],
  providers: [FacturasService],
})
export class FacturasModule {}
