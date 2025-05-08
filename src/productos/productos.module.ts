import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';
import { Producto } from './entities/producto.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategoria, Producto])],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
