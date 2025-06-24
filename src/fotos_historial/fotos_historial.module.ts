import { Module } from '@nestjs/common';
import { FotosHistorialService } from './fotos_historial.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FotosHistorial } from './entities/fotos_historial.entity';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([FotosHistorial, HistorialesMedico]),
  CloudinaryModule],
  controllers: [],
  providers: [FotosHistorialService],
  exports: [FotosHistorialService],
})
export class FotosHistorialModule {}
