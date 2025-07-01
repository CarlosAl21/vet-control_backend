import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class DetalleHistorial {
  @PrimaryGeneratedColumn('uuid')
  id_detalle_historial: string;

  @ManyToOne(
    () => HistorialesMedico,
    (historial) => historial.detalle_historial,
    { eager: true },
  )
  @JoinColumn({ name: 'id_historial' })
  id_historial: HistorialesMedico;

  @Column({ type: 'date' })
  fecha_registro: Date;

  @Column({ type: 'varchar', length: 255 })
  tratamiento: string;

  @Column({ type: 'varchar', length: 100 })
  medicamento: string;

  @Column({ type: 'varchar', length: 100 })
  dosis: string;

  @Column({ type: 'varchar', length: 100 })
  frecuencia: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  peso: number;

  @Column({ type: 'decimal', precision: 4, scale: 1, nullable: true })
  temperatura: number;

  @Column({ type: 'int', nullable: true })
  frecuencia_cardiaca: number;
}
