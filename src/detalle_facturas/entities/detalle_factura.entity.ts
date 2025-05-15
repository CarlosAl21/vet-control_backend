import { Factura } from 'src/facturas/entities/factura.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('detalle_factura')
export class DetalleFactura {
  @PrimaryGeneratedColumn('uuid')
  id_detalle: string;

  @Column('varchar', { length: 255 })
  descripcion: string;

  @Column('int')
  cantidad: number;

  @Column('decimal')
  precio_unitario: number;

  @Column('decimal')
  subtotal: number;

  @ManyToOne(() => Factura, factura => factura.detalles)
  factura: Factura;

  @ManyToOne(() => Lote, lote => lote.detalles)
  id_lote: Lote;
}
