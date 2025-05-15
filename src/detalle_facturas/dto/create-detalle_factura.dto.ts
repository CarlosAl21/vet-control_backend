import { DeepPartial } from 'typeorm';
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Factura } from 'src/facturas/entities/factura.entity';
import { Lote } from 'src/lotes/entities/lote.entity';

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
  id_factura: DeepPartial<Factura>;

  @IsInt()
  @IsNotEmpty()
  id_lote: DeepPartial<Lote>;
}
