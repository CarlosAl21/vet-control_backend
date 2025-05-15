import { PartialType } from '@nestjs/mapped-types';
import { CreateLoteDto } from './create-lote.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLoteDto extends PartialType(CreateLoteDto) {
    @ApiProperty({
      example: 'lote123',
      description: 'Identificador único del lote a actualizar',
      required: true,
    })
    @IsString()
    @IsNotEmpty()
    id_lote: string;
}
