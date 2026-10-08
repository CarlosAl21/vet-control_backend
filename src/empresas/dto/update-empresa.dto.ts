import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateEmpresaDto } from './create-empresa.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateEmpresaDto extends PartialType(CreateEmpresaDto) {
    @ApiProperty({ example: 'abc123xyz', description: 'Identificador único de la empresa' })
    @IsString()
    @IsNotEmpty()
    id_empresa: string;
}
