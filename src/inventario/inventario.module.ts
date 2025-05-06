import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';
import { Inventario } from './entities/inventario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario])], // Aquí puedes importar otros módulos si es necesario
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService], // Exportamos el servicio para que pueda ser utilizado en otros módulos
})
export class InventarioModule {}
