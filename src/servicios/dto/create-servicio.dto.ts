import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { DeepPartial } from 'typeorm';

export class CreateServicioDto {
  @ApiProperty({ example: 'Consulta general', description: 'Nombre del servicio' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({
    example: 'consulta',
    description: 'Tipo del servicio',
    enum: ['consulta', 'vacuna', 'cirugia', 'analitica', 'hospitalizacion', 'terapia'],
  })
  @IsEnum(['consulta', 'vacuna', 'cirugia', 'analitica', 'hospitalizacion', 'terapia'])
  tipo: 'consulta' | 'vacuna' | 'cirugia' | 'analitica' | 'hospitalizacion' | 'terapia';

  @ApiProperty({ example: 25.00, description: 'Precio del servicio' })
  @IsNumber()
  @IsNotEmpty()
  precio: number;

  @ApiProperty({ example: 15, description: 'Duración estimada en minutos', required: false, default: 15 })
  @IsNumber()
  @IsOptional()
  duracion_min?: number;

  @ApiProperty({ type: () => Empresa, description: 'Empresa (clínica) a la que pertenece el servicio' })
  @IsNotEmpty()
  id_empresa: DeepPartial<Empresa>;
}
