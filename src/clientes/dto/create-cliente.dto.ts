import { DeepPartial } from 'typeorm';
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from 'src/usuarios/entities/usuario.entity';

export class CreateClienteDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
    @IsString()
    @IsNotEmpty()
    apellido: string;

    @ApiProperty({ example: '0987654321', description: 'Teléfono del cliente', required: false })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del cliente', required: false })
    @IsString()
    @IsOptional()
    direccion?: string;

    @ApiProperty({ type: () => Empresa, description: 'Empresa asociada al cliente' })
    @IsNotEmpty()
    id_empresa: DeepPartial<Empresa>;

    @ApiProperty({ type: () => Usuario, description: 'Cuenta de usuario vinculada (opcional)', required: false })
    @IsOptional()
    id_usuario?: DeepPartial<Usuario>;
}
