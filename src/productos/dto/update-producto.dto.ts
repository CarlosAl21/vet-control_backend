import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateProductoDto } from './create-producto.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
    @ApiProperty({
        example: 'Termómetro digital veterinario actualizado',
        description: 'Nombre actualizado del producto',
    })
    @IsString()
    @IsNotEmpty()
    nombre: string;
}
