import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProveedoreDto } from './create-proveedor.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProveedoreDto extends PartialType(CreateProveedoreDto) {
    @ApiProperty({
        example: '6630a5e7fa13425fbc902345',
        description: 'Identificador único del proveedor a actualizar',
    })
    @IsString()
    @IsNotEmpty()
    id_proveedor: string;
}
