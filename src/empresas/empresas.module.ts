import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa])], // Aquí debes agregar las entidades que necesites
  controllers: [EmpresasController],
  providers: [EmpresasService],
  exports: [EmpresasService], // Exporta el servicio si lo necesitas en otros módulos
})
export class EmpresasModule {}
