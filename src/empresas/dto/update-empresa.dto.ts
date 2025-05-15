import { PartialType } from '@nestjs/swagger';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
    @IsString()
    @IsNotEmpty()
    id_empresa: string; // Identificador único de la empresa
}
