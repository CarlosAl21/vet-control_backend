import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateDetalleFacturaDto } from './create-detalle_factura.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDetalleFacturaDto extends PartialType(CreateDetalleFacturaDto) {
  @ApiProperty({
    description: 'Identificador único del detalle de factura',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  @IsString()
  @IsNotEmpty()
  id_detalle: string;
}
