import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateHistorialesMedicoDto } from './create-historiales_medico.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHistorialesMedicoDto extends PartialType(CreateHistorialesMedicoDto) {
    @ApiProperty({
      description: 'Identificador único del historial médico a actualizar',
      example: 'hist123',
    })
    @IsString()
    @IsNotEmpty()
    id_historial: string;
}
