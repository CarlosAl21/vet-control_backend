import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";

export class CreateLoteDto {
  @ApiProperty({
    example: 'Lote12345',
    description: 'Código único del lote',
  })
  @IsString()
  @IsNotEmpty()
  codigo_lote: string;

  @ApiProperty({
    example: '2025-05-14T00:00:00.000Z',
    description: 'Fecha de entrada del lote',
  })
  @IsDate()
  @IsNotEmpty()
  fecha_entrada: Date;

  @ApiProperty({
    example: '2026-05-14T00:00:00.000Z',
    description: 'Fecha de vencimiento del lote',
  })
  @IsDate()
  fecha_venc: Date;

  @ApiProperty({
    example: 100,
    description: 'Cantidad actual en stock',
  })
  @IsNumber()
  @IsNotEmpty()
  stock_actual: number;

  @ApiProperty({
    example: 'Activo',
    description: 'Estado del lote',
  })
  @IsString()
  @IsNotEmpty()
  estado: string;

  @ApiProperty({
    example: { id: 'prod123' },
    description: 'Producto asociado al lote',
  })
  @IsNotEmpty()
  id_producto: Producto;

  @ApiProperty({
    example: { id: 'prov123' },
    description: 'Proveedor asociado al lote',
  })
  @IsNotEmpty()
  id_proveedor: Proveedor;

  @ApiProperty({
    example: { id: 'emp123' },
    description: 'Empresa propietaria del lote',
  })
  @IsNotEmpty()
  id_empresa: Empresa;
}
