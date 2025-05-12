import { PartialType } from '@nestjs/swagger';
import { CreateProveedoreDto } from './create-proveedor.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProveedoreDto extends PartialType(CreateProveedoreDto) {
    @IsString()
    @IsNotEmpty()
    id_proveedor: string; // Identificador único del proveedor
}
