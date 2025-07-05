import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Empresa]),MailModule],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // si lo usas en otros módulos
})
export class UsuariosModule {}
