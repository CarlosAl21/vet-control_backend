import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class HistorialesMedico {
    @PrimaryGeneratedColumn('uuid')
    id_historial: string;

    @Column({ type: 'varchar', length: 50 })
    fecha: string;

    @Column({ type: 'varchar', length: 50 })
    diagnostico: string;

    @Column({ type: 'varchar', length: 50 })
    tratamiento: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    notas: string;

    @ManyToOne(() => Mascota, (mascota) => mascota.historiales_medicos)
    mascota: Mascota;
}
