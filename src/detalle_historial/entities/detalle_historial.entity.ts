import { HistorialesMedico } from 'src/historiales_medicos/entities/historiales_medico.entity';
import { Servicio } from 'src/servicios/entities/servicio.entity';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import {
  BeforeInsert,
  BeforeUpdate,
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

  @Column({ type: 'date'})
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  peso_kg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  temperatura_c: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  frecuencia_cardiaca: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  frecuencia_respiratoria: number;

  @Column({ type: 'varchar', length: 255 })
  diagnostico: string;

  @Column({ type: 'varchar', length: 255 })
  tratamiento: string;

  @Column({ type: 'varchar', length: 255 })
  observaciones: string;

  @Column({ type: 'json', nullable: true })
  otros_detalles: Record<string, any>;

  @ManyToOne(() => Servicio, (servicio) => servicio.detalle_historial, { eager: true })
  @JoinColumn({ name: 'id_servicio' })
  id_servicio: Servicio;

  @ManyToOne(() => Usuario, (usuario) => usuario.detalle_historial, { eager: true })
  @JoinColumn({ name: 'id_veterinario' })
  id_veterinario: Usuario;

  @Column({ type: 'timestamp'})
  fecha_creacion: Date;

  @Column({ type: 'timestamp', nullable: true })
  fecha_actualizacion: Date;

  @BeforeInsert()
  creacionFecha() {
    this.fecha_creacion = new Date();
    this.fecha = new Date();
  }

  @BeforeUpdate()
  actualizacionFecha() {
    this.fecha_actualizacion = new Date();
  }


  
}
