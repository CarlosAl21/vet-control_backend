import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
    @ApiProperty({
        description: 'Identificador único de la cita',
        example: 'cita-1234abcd-5678',
    })
    @IsString()
    @IsNotEmpty()
    id_cita: string;
}
