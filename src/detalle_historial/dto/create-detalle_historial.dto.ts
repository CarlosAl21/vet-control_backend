import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';

export class CreateDetalleHistorialDto {
  @ApiProperty({
    description: 'ID o entidad del historial médico asociado',
    type: () => HistorialesMedico,
    example: { id_historial: 'abc123', diagnostico: 'Gripe canina' },
  })
  @IsNotEmpty()
  id_historial: HistorialesMedico;

  @ApiProperty({
    description: 'Fecha de registro del detalle',
    example: '2025-06-24',
    type: Date,
    format: 'date',
  })
  @IsDate()
  @IsNotEmpty()
  fecha_registro: Date;

  @ApiProperty({
    description: 'Tratamiento aplicado',
    example: 'Antibióticos y reposo',
  })
  @IsString()
  @IsNotEmpty()
  tratamiento: string;

  @ApiProperty({
    description: 'Medicamento administrado',
    example: 'Amoxicilina',
  })
  @IsString()
  @IsNotEmpty()
  medicamento: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    example: '500mg',
  })
  @IsString()
  @IsNotEmpty()
  dosis: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'El paciente mostró mejoría al tercer día de tratamiento.',
  })
  @IsString()
  @IsOptional()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Peso del animal en kg',
    example: 12.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  peso?: number;

  @ApiPropertyOptional({
    description: 'Temperatura del animal en grados Celsius',
    example: 38.5,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  temperatura?: number;

  @ApiPropertyOptional({
    description: 'Frecuencia cardíaca del animal en latidos por minuto',
    example: 120,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  frecuencia_cardiaca?: number;
  
}
