import { Module } from '@nestjs/common';
import { HistorialesMedicosService } from './historiales_medicos.service';
import { HistorialesMedicosController } from './historiales_medicos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { HistorialesMedico } from './entities/historiales_medico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mascota, HistorialesMedico])], // Asegúrate de importar la entidad HistorialMedico aquí
  controllers: [HistorialesMedicosController],
  providers: [HistorialesMedicosService],
})
export class HistorialesMedicosModule {}
