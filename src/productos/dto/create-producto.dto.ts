import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { DeepPartial } from "typeorm";

export class CreateProductoDto {
    @ApiProperty({
        example: 'Termómetro digital veterinario',
        description: 'Nombre del producto',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        example: 'Dispositivo digital para medir la temperatura corporal de animales',
        description: 'Descripción detallada del producto',
    })
    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @ApiProperty({
        example: 15.75,
        description: 'Precio unitario del producto',
    })
    @IsNumber()
    @IsNotEmpty()
    precio_unitario: number;

    @ApiProperty({
        example: { id_subcategoria: '6631b345a2123c9f2ab45e3c' },
        description: 'ID de la subcategoría asociada al producto',
    })
    @IsNotEmpty()
    id_subcategoria: DeepPartial<Subcategoria>;

    @ApiProperty({
        example: { id_empresa: '661faed5b2c7a3f8a41c9a1b' },
        description: 'ID de la empresa a la que pertenece el producto',
    })
    @IsNotEmpty()
    id_empresa: DeepPartial<Empresa>;
}
