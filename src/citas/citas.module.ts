import { Module } from '@nestjs/common';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Cita } from './entities/cita.entity';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cita, Usuario, Mascota]),
  MailModule],
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService],
})
export class CitasModule {}
