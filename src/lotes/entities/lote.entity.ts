import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn('uuid')
  id_lote: string;

  @Column()
  codigo_lote: string;

  @Column({ type: 'date' })
  fecha_entrada: Date;

  @Column({ type: 'date' })
  fecha_venc: Date;

  @Column()
  stock_actual: number;

  @Column()
  estado: string;

  @OneToMany(()=> DetalleFactura, (detalleFactura) => detalleFactura.id_lote)
  detalles: DetalleFactura[];

  @ManyToOne(() => Producto, (producto) => producto.lotes)
  @JoinColumn({ name: 'id_producto' })  
  id_producto: Producto;

  @ManyToOne(() => Proveedor, (proveedor) => proveedor.lotes)
  @JoinColumn({ name: 'id_proveedor' })
  id_proveedor: Proveedor;

  @ManyToOne(() => Empresa, (empresa) => empresa.lotes)
  @JoinColumn({ name: 'id_empresa' })
  id_empresa: Empresa;
}
