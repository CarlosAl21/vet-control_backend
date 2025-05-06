import { PartialType } from '@nestjs/swagger';
import { CreateInventarioDto } from './create-inventario.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateInventarioDto extends PartialType(CreateInventarioDto) {
    @IsString()
    @IsNotEmpty()
    id_producto: string;
}
