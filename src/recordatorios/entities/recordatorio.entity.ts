import { Mascota } from "src/mascotas/entities/mascota.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Recordatorio {
    @PrimaryGeneratedColumn('uuid')
    id_recordatorio: string;

    @Column({ type: 'varchar', length: 50 })
    tipo: string;

    @Column({ type: 'varchar', length: 100 })
    titulo: string;

    @Column({ type: 'varchar', length: 255 })
    descripcion: string;

    @Column({ type: 'date' })
    fecha_programada: Date;

    @Column({ type: 'boolean', default: false })
    completado: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_creacion: Date;

    @Column({ type: 'timestamp', nullable: true })
    fecha_actualizacion: Date;

    @ManyToOne(() => Mascota, (mascota) => mascota.recordatorios)
    @JoinColumn({ name: 'id_mascota' })
    id_mascota: Mascota;

    @BeforeInsert()
    setFechaCreacion() {
        this.fecha_creacion = new Date();
    }

    @BeforeUpdate()
    setFechaActualizacion() {
        this.fecha_actualizacion = new Date();
    }

}
