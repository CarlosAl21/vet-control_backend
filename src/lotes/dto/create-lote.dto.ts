import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";

export class CreateLoteDto {
  @IsString()
  @IsNotEmpty()
  codigo_lote: string;

  @IsDate()
  @IsNotEmpty()
  fecha_entrada: Date;

  @IsDate()
  fecha_venc: Date;

  @IsNumber()
  @IsNotEmpty()
  stock_actual: number;

  @IsString()
  @IsNotEmpty()
  estado: string;

  @IsNotEmpty()
  id_producto: Producto;

  @IsNotEmpty()
  id_proveedor: Proveedor;

  @IsNotEmpty()
  id_empresa: Empresa;
}
