import { DeepPartial } from 'typeorm';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Factura } from 'src/facturas/entities/factura.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDetalleFacturaDto {
  @ApiProperty({
    description: 'Descripción del detalle de la factura',
    example: 'Venta de medicamento X',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Cantidad de productos',
    example: 10,
  })
  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @ApiProperty({
    description: 'Precio unitario del producto',
    example: 15.5,
  })
  @IsNumber()
  @IsNotEmpty()
  precio_unitario: number;

  @ApiProperty({
    description: 'Subtotal (cantidad * precio unitario)',
    example: 155,
  })
  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @ApiProperty({
    description: 'ID parcial o referencia de la factura relacionada',
    example: { id_factura: 123 },
    type: Object,
  })
  @IsInt()
  @IsNotEmpty()
  id_factura: DeepPartial<Factura>;

  @ApiProperty({
    description: 'ID parcial o referencia del lote relacionado',
    example: { id_lote: 456 },
    type: Object,
  })
  @IsInt()
  @IsNotEmpty()
  id_lote: DeepPartial<Lote>;
}
