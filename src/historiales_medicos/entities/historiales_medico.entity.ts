import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { FotosHistorial } from "src/fotos_historial/entities/fotos_historial.entity";

@Entity()
export class HistorialesMedico {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del historial médico' })
    @PrimaryGeneratedColumn('uuid')
    id_historial: string;

    @ApiProperty({ example: '2024-06-01', description: 'Fecha del historial médico' })
    @Column({ type: 'varchar', length: 50 })
    fecha: string;

    @ApiProperty({ example: 'Gripe canina', description: 'Diagnóstico realizado' })
    @Column({ type: 'varchar', length: 50 })
    diagnostico: string;

    @ApiProperty({ example: 'Antibióticos por 7 días', description: 'Tratamiento indicado' })
    @Column({ type: 'varchar', length: 50 })
    tratamiento: string;

    @ApiProperty({ example: 'Revisar en una semana', description: 'Notas adicionales', required: false })
    @Column({ type: 'varchar', length: 50, nullable: true })
    notas: string;

    @ApiProperty({ type: () => Mascota, description: 'Mascota asociada al historial médico' })
    @ManyToOne(() => Mascota, (mascota) => mascota.historiales_medicos)
    @JoinColumn({ name: 'id_mascota' })
    id_mascota: Mascota;

    @OneToMany(() => FotosHistorial, (fotosHistorial) => fotosHistorial.historial)
    fotos_historial: FotosHistorial[];
}
