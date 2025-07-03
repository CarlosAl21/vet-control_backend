import { Module } from '@nestjs/common';
import { RecordatoriosService } from './recordatorios.service';
import { RecordatoriosController } from './recordatorios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recordatorio } from './entities/recordatorio.entity';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recordatorio, Mascota])],
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
