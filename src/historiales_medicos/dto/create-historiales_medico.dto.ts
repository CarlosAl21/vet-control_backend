import { IsNotEmpty, IsString } from "class-validator";
import { Mascota } from "src/mascotas/entities/mascota.entity";
import { ApiProperty } from '@nestjs/swagger';
import { DeepPartial } from "typeorm";
import { Empresa } from "src/empresas/entities/empresa.entity";

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
      description: 'Mascota asociada al historial médico (objeto Mascota o ID)',
      type: () => Mascota,
      example: { id_mascota: 'abc123', nombre: 'Firulais' },
    })
    @IsNotEmpty()
    id_mascota: DeepPartial<Mascota>;

    @ApiProperty({
      description: 'Empresa asociada al historial médico (objeto Empresa o ID)',
      type: () => Empresa,
      example: { id_empresa: 'xyz789', nombre: 'Veterinaria Central' },
    })
    @IsNotEmpty()
    id_empresa: DeepPartial<Empresa>;
    
}
