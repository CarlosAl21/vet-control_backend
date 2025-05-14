import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { MascotasService } from './mascotas.service';
import { MascotasController } from './mascotas.controller';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { Mascota } from './entities/mascota.entity'; // 👈 Asegúrate de importar esto

@Module({
  imports: [TypeOrmModule.forFeature([Mascota, Cliente])], // 👈 Aquí agregas Mascota
  controllers: [MascotasController],
  providers: [MascotasService],
  exports: [MascotasService],
})
export class MascotasModule {}
