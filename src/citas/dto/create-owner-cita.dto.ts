import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Owner booking: the usuario comes from the token and estado is forced to Pendiente on insert.
export class CreateOwnerCitaDto {
  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2025-06-01T14:30:00Z',
    type: String,
    format: 'date-time',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  fecha_hora: Date;

  @ApiProperty({
    description: 'Motivo de la cita',
    example: 'Consulta general por malestar',
    maxLength: 250,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(250)
  motivo: string;

  @ApiProperty({
    description: 'ID de una mascota del dueño autenticado',
    example: '987e6543-e21b-32d3-b654-426614174999',
  })
  @IsUUID()
  mascotaId: string;

  @ApiProperty({
    description: 'ID de una clínica donde el dueño es cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  empresaId: string;
}
