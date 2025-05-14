import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventario } from './entities/inventario.entity';
import { InventarioService } from './inventario.service';
import { InventarioController } from './inventario.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Inventario])], // <--- ¡IMPORTANTE!
  controllers: [InventarioController],
  providers: [InventarioService],
  exports: [InventarioService], // si se usa en otros módulos
})
export class InventarioModule {}
