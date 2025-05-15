import { PartialType } from '@nestjs/mapped-types';
import { CreateLoteDto } from './create-lote.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateLoteDto extends PartialType(CreateLoteDto) {
    @IsString()
    @IsNotEmpty()
    id_lote: string;
}
