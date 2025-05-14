import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDetalleFacturaDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsInt()
  @IsNotEmpty()
  cantidad: number;

  @IsNumber()
  @IsNotEmpty()
  precio_unitario: number;

  @IsNumber()
  @IsNotEmpty()
  subtotal: number;

  @IsInt()
  @IsNotEmpty()
  id_factura: number;

  @IsInt()
  @IsNotEmpty()
  id_lote: number;
}
