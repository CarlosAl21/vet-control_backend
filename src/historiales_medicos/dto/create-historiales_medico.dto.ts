import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateHistorialesMedicoDto {
    @ApiProperty({
      description: 'Fecha de la consulta médica',
      example: '2025-05-14',
    })
    @IsString()
    @IsNotEmpty()
    fecha: string;

    @ApiProperty({
      description: 'Diagnóstico realizado',
      example: 'Infección respiratoria leve',
    })
    @IsString()
    @IsNotEmpty()
    diagnostico: string;

    @ApiProperty({
      description: 'ID de la mascota asociada al historial médico',
      example: 'uuid-mascota-1234',
    })
    @IsString()
    @IsNotEmpty()
    id_mascota: string;

    @ApiProperty({
      description: 'ID de la empresa asociada al historial médico',
      example: 'uuid-empresa-5678',
    })
    @IsString()
    @IsNotEmpty()
    id_empresa: string;
    
}
