import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/cliente.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MailModule } from 'src/mail/mail.module';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cliente, Empresa, Usuario]),
  MailModule],
  controllers: [ClientesController],
  providers: [ClientesService],
  exports: [ClientesService],
})
export class ClientesModule {}
