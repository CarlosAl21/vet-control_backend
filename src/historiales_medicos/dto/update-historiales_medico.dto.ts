import { PartialType } from '@nestjs/swagger';
import { CreateHistorialesMedicoDto } from './create-historiales_medico.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateHistorialesMedicoDto extends PartialType(CreateHistorialesMedicoDto) {
    @IsString()
    @IsNotEmpty()
    id_historial: string;
}
