import e from "express";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class FotosHistorial {
    @PrimaryGeneratedColumn('uuid')
    id_fotos_historial: string;

    @Column({ type: 'varchar', length: 255 })
    url: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    public_id: string;

    @ManyToOne(() => HistorialesMedico, (historial) => historial.fotos_historial,{eager: true})
    @JoinColumn({ name: 'id_historial' })
    historial: HistorialesMedico;

    
}
