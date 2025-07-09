import { IsDate, IsNotEmpty, IsString } from 'class-validator';
import { Mascota } from 'src/mascotas/entities/mascota.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCitaDto {
  @ApiProperty({
    description: 'Fecha y hora de la cita',
    example: '2025-06-01T14:30:00Z',
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsNotEmpty()
  fecha_hora: Date;

  @ApiProperty({
    description: 'Motivo de la cita',
    example: 'Consulta general por malestar',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;

  @ApiProperty({
    description: 'Estado actual de la cita',
    example: 'Pendiente',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    description: 'ID o entidad del usuario que agenda la cita',
    example: { id: '123e4567-e89b-12d3-a456-426614174000' },
    type: Object,
  })
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({
    description: 'ID de la mascota para la cita',
    example: '987e6543-e21b-32d3-b654-426614174999',
  })
  @IsString()
  @IsNotEmpty()
  mascotaId: string;
}
