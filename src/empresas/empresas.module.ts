import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { EmpresasController } from './empresas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Empresa, Proveedor])], // Aquí debes agregar las entidades que necesites
  controllers: [EmpresasController],
  providers: [EmpresasService],
})
export class EmpresasModule {}
