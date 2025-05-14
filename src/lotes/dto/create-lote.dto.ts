export class CreateLoteDto {
  codigo_lote: string;
  fecha_entrada: Date;
  fecha_venc: Date;
  stock_actual: number;
  estado: string;
  id_producto: number;
  id_proveedor: number;
  id_empresa: number;
}
