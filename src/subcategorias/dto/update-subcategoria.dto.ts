import { PartialType } from '@nestjs/swagger';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {
    @IsString()
    @IsNotEmpty()
    id_subcategoria: string;
}
