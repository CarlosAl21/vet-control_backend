import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateServicioDto } from './create-servicio.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateServicioDto extends PartialType(CreateServicioDto) {
    @ApiProperty({ example: 'servicio123', description: 'ID del servicio a actualizar' })
    @IsString()
    @IsNotEmpty()
    id_servicio: string;
}
