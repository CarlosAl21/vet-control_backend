import { PartialType } from '@nestjs/swagger';
import { CreateProductoDto } from './create-producto.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
