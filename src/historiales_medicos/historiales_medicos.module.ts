import { Module } from '@nestjs/common';
import { HistorialesMedicosService } from './historiales_medicos.service';
import { HistorialesMedicosController } from './historiales_medicos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mascota])],
  controllers: [HistorialesMedicosController],
  providers: [HistorialesMedicosService],
})
export class HistorialesMedicosModule {}
