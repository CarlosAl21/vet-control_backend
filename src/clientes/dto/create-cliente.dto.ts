import { IsNotEmpty, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { ApiProperty } from '@nestjs/swagger';

export class CreateClienteDto {
    @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
    @IsString()
    @IsNotEmpty()
    apellido: string;

    @ApiProperty({ example: 'juan.perez@email.com', description: 'Correo electrónico del cliente' })
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '+593987654321', description: 'Número de teléfono del cliente' })
    @IsString()
    @IsNotEmpty()
    telefono: string;

    @ApiProperty({ example: 'Av. Siempre Viva 123', description: 'Dirección del cliente' })
    @IsString()
    @IsNotEmpty()
    direccion: string;
    
    @ApiProperty({ type: () => Empresa, description: 'Entidad empresa asociada al cliente' })
    @IsNotEmpty()
    id_empresa: Empresa; // Cambiado a string para reflejar el ID de la empresa
}
