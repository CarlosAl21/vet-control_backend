import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateMascotaDto } from './create-mascota.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMascotaDto extends PartialType(CreateMascotaDto) {
    @ApiProperty({
        example: '62f4d9a4e1234b5678c9d012',
        description: 'Identificador único de la mascota',
    })
    @IsString()
    @IsNotEmpty()
    id_mascota: string;
}
