import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoriaDto {
    @ApiProperty({
        description: 'Nombre de la categoría',
        example: 'Medicamentos',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string; // Nombre de la categoría
}
