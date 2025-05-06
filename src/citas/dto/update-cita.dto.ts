import { PartialType } from '@nestjs/swagger';
import { CreateCitaDto } from './create-cita.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCitaDto extends PartialType(CreateCitaDto) {
    @IsString()
    @IsNotEmpty()
    id_cita: string;
}
