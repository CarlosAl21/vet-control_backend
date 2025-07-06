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
    enum: ['consulta', 'vacunacion', 'diagnostico', 'cirugia', 'hospitalizacion', 'urgencias',
  'medicina_preventiva', 'especialidades', 'odontologia', 'terapias', 'estetica'],
  })
  @IsEnum(['consulta', 'vacunacion', 'diagnostico', 'cirugia', 'hospitalizacion', 'urgencias',
  'medicina_preventiva', 'especialidades', 'odontologia', 'terapias', 'estetica'])
  tipo: 'consulta' | 'vacunacion' | 'diagnostico' | 'cirugia' | 'hospitalizacion' | 'urgencias' |
  'medicina_preventiva' | 'especialidades' | 'odontologia' | 'terapias' | 'estetica' 

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
