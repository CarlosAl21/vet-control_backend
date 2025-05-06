import { Module } from '@nestjs/common';
import { SubcategoriasService } from './subcategorias.service';
import { SubcategoriasController } from './subcategorias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategoria } from './entities/subcategoria.entity';
import { Categoria } from 'src/categorias/entities/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategoria, Categoria])],
  controllers: [SubcategoriasController],
  providers: [SubcategoriasService],
  exports: [SubcategoriasService]
})
export class SubcategoriasModule {}
