import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity('lotes')
export class Lote {
  @PrimaryGeneratedColumn()
  id_lote: number;

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

  @Column()
  id_producto: number;

  @Column()
  id_proveedor: number;

  @Column()
  id_empresa: number;
}
