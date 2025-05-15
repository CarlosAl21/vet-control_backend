import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateSubcategoriaDto } from './create-subcategoria.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSubcategoriaDto extends PartialType(CreateSubcategoriaDto) {
    @ApiProperty({
        example: '662a3b1f8cfb3d7e6b12d34c',
        description: 'ID único de la subcategoría a actualizar',
    })
    @IsString()
    @IsNotEmpty()
    id_subcategoria: string;
}
