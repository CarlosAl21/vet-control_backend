import { PartialType } from '@nestjs/swagger';
import { CreateDetalleFacturaDto } from './create-detalle_factura.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDetalleFacturaDto extends PartialType(CreateDetalleFacturaDto) {
    @IsString()
    @IsNotEmpty()
    id_detalle: string;
}
