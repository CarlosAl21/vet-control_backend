import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCategoriaDto } from './create-categoria.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {
    @ApiProperty({
        description: 'Identificador único de la categoría',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    id_categoria: string; // Identificador único de la categoría
}
