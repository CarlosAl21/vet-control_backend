import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmpresaDto {
    @ApiProperty({ example: 'Empresa XYZ', description: 'Nombre de la empresa' })
    @IsString()
    @IsNotEmpty()
    nombre: string;
    
    @ApiProperty({ example: '1234567890001', description: 'RUC de la empresa' })
    @IsString()
    @IsNotEmpty()
    ruc: string;
    
    @ApiProperty({ example: 'Av. Siempre Viva 742', description: 'Dirección de la empresa' })
    @IsString()
    @IsNotEmpty()
    direccion: string;

    @ApiProperty({ example: '0998765432', description: 'Teléfono de la empresa' })
    @IsString()
    @IsNotEmpty()
    telefono: string;

    @ApiProperty({ example: 'contacto@empresa.com', description: 'Correo electrónico de la empresa' })
    @IsString()
    @IsNotEmpty()
    email: string;
}
