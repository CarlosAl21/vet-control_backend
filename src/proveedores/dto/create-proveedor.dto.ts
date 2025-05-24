import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Empresa } from "src/empresas/entities/empresa.entity";

export class CreateProveedoreDto {
    @ApiProperty({
        example: 'Distribuidora López',
        description: 'Nombre del proveedor',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        example: 'Av. 9 de Octubre y Pedro Carbo',
        description: 'Dirección física del proveedor',
    })
    @IsString()
    @IsNotEmpty()
    direccion: string;

    @ApiProperty({
        example: '0991234567',
        description: 'Número de teléfono de contacto del proveedor',
    })
    @IsString()
    @IsNotEmpty()
    telefono: string;

    @ApiProperty({
        example: 'proveedor@ejemplo.com',
        description: 'Correo electrónico del proveedor',
    })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '661faed5b2c7a3f8a41c9a1b',
        description: 'ID de la empresa asociada al proveedor',
    })
    @IsNotEmpty()
    id_empresa: Empresa;
}
