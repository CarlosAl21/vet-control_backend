import { Factura } from 'src/facturas/entities/factura.entity';
import { Lote } from 'src/lotes/entities/lote.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('detalle_factura')
export class DetalleFactura {
  @ApiProperty({ example: 'uuid', description: 'Identificador único del detalle de factura' })
  @PrimaryGeneratedColumn('uuid')
  id_detalle: string;

  @ApiProperty({ example: 'Producto X, 2kg', description: 'Descripción del detalle de factura' })
  @Column('varchar', { length: 255 })
  descripcion: string;

  @ApiProperty({ example: 2, description: 'Cantidad de productos en el detalle' })
  @Column('int')
  cantidad: number;

  @ApiProperty({ example: 15.5, description: 'Precio unitario del producto' })
  @Column('decimal')
  precio_unitario: number;

  @ApiProperty({ example: 31.0, description: 'Subtotal del detalle de factura' })
  @Column('decimal')
  subtotal: number;

  @ApiProperty({ type: () => Factura, description: 'Factura asociada al detalle' })
  @ManyToOne(() => Factura, factura => factura.detalles)
  @JoinColumn({ name: 'id_factura' })
  id_factura: Factura;

  @ApiProperty({ type: () => Lote, description: 'Lote asociado al detalle' })
  @ManyToOne(() => Lote, lote => lote.detalles)
  @JoinColumn({ name: 'id_lote' })
  id_lote: Lote;
}
