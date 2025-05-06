import { Factura } from 'src/facturas/entities/factura.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('detalle_factura')
export class DetalleFactura {
  @PrimaryGeneratedColumn()
  id_detalle: number;

  @Column('text')
  descripcion: string;

  @Column('int')
  cantidad: number;

  @Column('decimal')
  precio_unitario: number;

  @Column('decimal')
  subtotal: number;

  @ManyToOne(() => Factura, factura => factura.detalles)
  factura: Factura;
}
