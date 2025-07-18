import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacturasService } from './facturas.service';
import { FacturasController } from './facturas.controller';
import { Factura } from './entities/factura.entity';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MailModule } from 'src/mail/mail.module';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Factura, Cliente, Empresa, Usuario]),
  MailModule],
  controllers: [FacturasController],
  providers: [FacturasService],
  exports: [FacturasService],
})
export class FacturasModule {}
