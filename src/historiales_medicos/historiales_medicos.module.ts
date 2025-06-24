import { CloudinaryModule } from './../cloudinary/cloudinary.module';
import { Module } from '@nestjs/common';
import { HistorialesMedicosService } from './historiales_medicos.service';
import { HistorialesMedicosController } from './historiales_medicos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { HistorialesMedico } from './entities/historiales_medico.entity';
import { FotosHistorial } from 'src/fotos_historial/entities/fotos_historial.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistorialesMedico, Mascota, FotosHistorial]),
  CloudinaryModule],
  controllers: [HistorialesMedicosController],
  providers: [HistorialesMedicosService],
})
export class HistorialesMedicosModule {}
