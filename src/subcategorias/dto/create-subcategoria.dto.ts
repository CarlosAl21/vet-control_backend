import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Categoria } from "src/categorias/entities/categoria.entity";

export class CreateSubcategoriaDto {
    @ApiProperty({
        example: 'Accesorios para mascotas',
        description: 'Nombre de la subcategoría',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        example: '661faed5b2c7a3f8a41c9a1b',
        description: 'ID de la categoría principal asociada',
    })
    @IsNotEmpty()
    id_categoria: Categoria;
}
