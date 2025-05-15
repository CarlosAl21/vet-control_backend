import { PartialType } from '@nestjs/swagger';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
    @IsString()
    @IsNotEmpty()
    id_categoria: string; // Identificador único de la categoría
}
