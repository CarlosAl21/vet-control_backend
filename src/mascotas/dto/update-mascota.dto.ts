import { PartialType } from '@nestjs/swagger';
import { CreateMascotaDto } from './create-mascota.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMascotaDto extends PartialType(CreateMascotaDto) {
    @IsString()
    @IsNotEmpty()
    id_mascota: string;
}
