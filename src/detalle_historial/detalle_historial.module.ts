import { Module } from '@nestjs/common';
import { DetalleHistorialService } from './detalle_historial.service';
import { DetalleHistorialController } from './detalle_historial.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleHistorial } from './entities/detalle_historial.entity';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DetalleHistorial, HistorialesMedico, Usuario, Servicio])], // Add your entities here if needed
  controllers: [DetalleHistorialController],
  providers: [DetalleHistorialService],
  exports: [DetalleHistorialService], // Export the service if needed in other modules
})
export class DetalleHistorialModule {}
