import { DetalleFactura } from 'src/detalle_facturas/entities/detalle_factura.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { Proveedor } from 'src/proveedores/entities/proveedor.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('lotes')
export class Lote {
  @ApiProperty({ example: 'uuid', description: 'Identificador único del lote' })
  @PrimaryGeneratedColumn('uuid')
  id_lote: string;

  @ApiProperty({ example: 'LT-2024-001', description: 'Código del lote' })
  @Column()
  codigo_lote: string;

  @ApiProperty({ example: '2024-06-01', description: 'Fecha de entrada del lote' })
  @Column({ type: 'date' })
  fecha_entrada: Date;

  @ApiProperty({ example: '2025-06-01', description: 'Fecha de vencimiento del lote' })
  @Column({ type: 'date' })
  fecha_venc: Date;

  @ApiProperty({ example: 100, description: 'Stock actual del lote' })
  @Column()
  stock_actual: number;

  @ApiProperty({ example: 'activo', description: 'Estado del lote' })
  @Column()
  estado: string;

  @ApiProperty({ type: () => [DetalleFactura], description: 'Detalles de factura asociados al lote' })
  @OneToMany(()=> DetalleFactura, (detalleFactura) => detalleFactura.id_lote)
  detalles: DetalleFactura[];

  @ApiProperty({ type: () => Producto, description: 'Producto asociado al lote' })
  @ManyToOne(() => Producto, (producto) => producto.lotes)
  @JoinColumn({ name: 'id_producto' })  
  id_producto: Producto;

  @ApiProperty({ type: () => Proveedor, description: 'Proveedor asociado al lote' })
  @ManyToOne(() => Proveedor, (proveedor) => proveedor.lotes)
  @JoinColumn({ name: 'id_proveedor' })
  id_proveedor: Proveedor;

  @ApiProperty({ type: () => Empresa, description: 'Empresa asociada al lote' })
  @ManyToOne(() => Empresa, (empresa) => empresa.lotes)
  @JoinColumn({ name: 'id_empresa' })
  id_empresa: Empresa;
}
