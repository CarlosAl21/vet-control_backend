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

  @ApiProperty({
    description: 'Peso del animal en kg',
    example: 12.5,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  peso_kg: number;

  @ApiProperty({
    description: 'Temperatura del animal en grados Celsius',
    example: 38.5,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  temperatura_c: number;

  @ApiProperty({
    description: 'Frecuencia cardíaca del animal en latidos por minuto',
    example: 120,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  frecuencia_cardiaca: number;

  @ApiProperty({
    description: 'Frecuencia respiratoria del animal',
    example: 30,
    type: Number,
  })
  @IsNumber()
  @IsNotEmpty()
  frecuencia_respiratoria: number;

  @ApiProperty({
    description: 'Diagnóstico realizado',
    example: 'Gripe canina',
  })
  @IsString()
  @IsNotEmpty()
  diagnostico: string;

  @ApiProperty({
    description: 'Tratamiento aplicado',
    example: 'Antibióticos y reposo',
  })
  @IsString()
  @IsNotEmpty()
  tratamiento: string;

  @ApiProperty({
    description: 'Observaciones adicionales',
    example: 'El paciente mostró mejoría al tercer día de tratamiento.',
  })
  @IsString()
  @IsNotEmpty()
  observaciones: string;

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
