import { IsNotEmpty, IsString } from "class-validator";
import { Mascota } from "src/mascotas/entities/mascota.entity";
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
      description: 'Tratamiento prescrito',
      example: 'Antibióticos por 7 días',
    })
    @IsString()
    @IsNotEmpty()
    tratamiento: string;

    @ApiProperty({
      description: 'Notas adicionales del veterinario',
      example: 'Se recomienda reposo y seguimiento en 3 días',
      required: false,
    })
    @IsString()
    notas: string;

    @ApiProperty({
      description: 'Mascota asociada al historial médico (objeto Mascota o ID)',
      type: () => Mascota,
      example: { id_mascota: 'abc123', nombre: 'Firulais' },
    })
    @IsNotEmpty()
    id_mascota: Mascota;
}
