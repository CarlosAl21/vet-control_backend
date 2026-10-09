import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { DeepPartial } from 'typeorm';

export class CreateDetalleHistorialDto {
  @ApiProperty({
    description: 'ID o entidad del historial médico asociado',
    type: () => HistorialesMedico,
    example: { id_historial: 'abc123'},
  })
  @IsNotEmpty()
  id_historial: DeepPartial<HistorialesMedico>;

  @ApiPropertyOptional({
    description: 'Peso del animal en kg',
    example: 12.5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  peso_kg?: number;

  @ApiPropertyOptional({
    description: 'Temperatura del animal en grados Celsius',
    example: 38.5,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  temperatura_c?: number;

  @ApiPropertyOptional({
    description: 'Frecuencia cardíaca del animal en latidos por minuto',
    example: 120,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuencia_cardiaca?: number;

  @ApiPropertyOptional({
    description: 'Frecuencia respiratoria del animal',
    example: 30,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  frecuencia_respiratoria?: number;

  @ApiPropertyOptional({
    description: 'Diagnóstico realizado',
    example: 'Gripe canina',
  })
  @IsOptional()
  @IsString()
  diagnostico?: string;

  @ApiPropertyOptional({
    description: 'Tratamiento aplicado',
    example: 'Antibióticos y reposo',
  })
  @IsOptional()
  @IsString()
  tratamiento?: string;

  @ApiPropertyOptional({
    description: 'Observaciones adicionales',
    example: 'El paciente mostró mejoría al tercer día de tratamiento.',
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Campo flexible para información personalizada',
    example: { mucosas: 'rosadas', glucosa: '120 mg/dL' },
    type: Object,
  })
  @IsOptional()
  otros_detalles?: Record<string, any>;

  @ApiProperty({
    description: 'Servicio asociado al detalle',
    type: () => Servicio,
    example: { id_servicio: 'serv123'},
  })
  @IsNotEmpty()
  id_servicio: DeepPartial<Servicio>;

  @ApiProperty({
    description: 'Veterinario responsable',
    type: () => Usuario,
    example: { id_usuario: 'vet123'},
  })
  @IsNotEmpty()
  id_veterinario: DeepPartial<Usuario>;
}
