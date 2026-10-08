import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { DeepPartial } from "typeorm";

export class CreateUsuarioDto {
    @ApiProperty({
        example: 'Carlos',
        description: 'Nombre del usuario',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({
        example: 'Alvarado',
        description: 'Apellido del usuario',
    })
    @IsString()
    @IsNotEmpty()
    apellido: string;

    @ApiProperty({
        example: 'carlos@example.com',
        description: 'Correo electrónico del usuario',
    })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '0987654321',
        description: 'Telefono del usuario',
    })
    @IsString()
    @IsNotEmpty()
    telefono: string;

    @ApiProperty({
        example: 'Quito, Ecuador',
        description: 'Dirección del usuario',
    })
    @IsString()
    @IsNotEmpty()
    direccion: string;

    @ApiProperty({
        example: 'ContrasenaSegura123',
        description: 'Contraseña del usuario (en texto plano, se recomienda cifrado posterior)',
    })
    @IsString()
    @IsNotEmpty()
    contraseña: string;

    @ApiProperty({
        example: '64c9e4b2f0a4e3a1c2d6e9f5',
        description: 'ID de la empresa a la que pertenece el usuario',
    })
    @IsOptional()
    @IsString()
    id_empresa?: DeepPartial<Empresa>; // Puede ser un string o una entidad Empresa, dependiendo de cómo se maneje la relación en tu aplicación

    @ApiPropertyOptional({
        example: 'admin',
        description: 'Rol del usuario (opcional)',
    })
    @IsOptional()
    @IsString()
    rol?: string;
}

