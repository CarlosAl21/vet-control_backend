import { Module } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CategoriasController } from './categorias.controller';
import { Categoria } from './entities/categoria.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategoria } from 'src/subcategorias/entities/subcategoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Subcategoria])],
  controllers: [CategoriasController],
  providers: [CategoriasService],
  exports: [ CategoriasService]
})
export class CategoriasModule {}
