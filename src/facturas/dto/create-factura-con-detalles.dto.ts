import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateFacturaDetalleItemDto {
  @ApiProperty({ example: 'Venta de medicamento X', description: 'Descripción del detalle' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ example: 2, description: 'Cantidad (entero mayor que 0)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cantidad: number;

  @ApiProperty({ example: 15.5, description: 'Precio unitario (mayor o igual a 0)' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precio_unitario: number;

  @ApiPropertyOptional({
    example: 'uuid-lote-456',
    description: 'Lote del que se descuenta el stock (opcional)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id_lote?: string;
}

/** The server computes every subtotal and the total; any client value for them is discarded. */
export class CreateFacturaConDetallesDto {
  @ApiProperty({ example: '2025-05-14T10:30:00Z', description: 'Fecha de emisión en formato ISO 8601' })
  @IsDateString()
  @IsNotEmpty()
  fecha_emision: Date;

  @ApiProperty({ example: 'Efectivo', description: 'Método de pago utilizado' })
  @IsString()
  @IsNotEmpty()
  metodo_pago: string;

  @ApiProperty({ example: 'uuid-cliente-1234', description: 'ID del cliente de la factura' })
  @IsString()
  @IsNotEmpty()
  id_cliente: string;

  @ApiPropertyOptional({ enum: ['pagado', 'pendiente', 'anulado'], default: 'pendiente' })
  @IsOptional()
  @IsIn(['pagado', 'pendiente', 'anulado'])
  estado?: 'pagado' | 'pendiente' | 'anulado';

  @ApiProperty({ type: () => [CreateFacturaDetalleItemDto], description: 'Al menos un detalle' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateFacturaDetalleItemDto)
  detalles: CreateFacturaDetalleItemDto[];
}
