import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFacturaDto } from './create-factura.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateFacturaDto extends PartialType(CreateFacturaDto) {
    @ApiProperty({
        example: 'uuid-factura-1234',
        description: 'Identificador único de la factura a actualizar',
    })
    @IsString()
    @IsNotEmpty()
    id_factura: number;
}
