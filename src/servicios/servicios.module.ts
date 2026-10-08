import { Module } from '@nestjs/common';
import { ServiciosService } from './servicios.service';
import { ServiciosController } from './servicios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Servicio } from './entities/servicio.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Servicio, Empresa])],
  controllers: [ServiciosController],
  providers: [ServiciosService],
  exports: [ServiciosService],
})
export class ServiciosModule {}
