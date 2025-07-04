import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, BeforeInsert, BeforeUpdate, OneToMany } from "typeorm";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { ApiProperty } from '@nestjs/swagger';
import { DetalleHistorial } from "src/detalle_historial/entities/detalle_historial.entity";

@Entity()
export class Servicio {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del servicio' })
    @PrimaryGeneratedColumn('uuid')
    id_servicio: string;

    @ApiProperty({ example: 'Consulta general', description: 'Nombre del servicio' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ 
        example: 'consulta', 
        description: 'Tipo del servicio', 
        enum: ['consulta', 'vacuna', 'cirugia', 'analitica', 'hospitalizacion', 'terapia'] 
    })
    @Column({ type: 'enum', enum: ['consulta', 'vacuna', 'cirugia', 'analitica', 'hospitalizacion', 'terapia'] })
    tipo: 'consulta' | 'vacuna' | 'cirugia' | 'analitica' | 'hospitalizacion' | 'terapia';

    @ApiProperty({ example: 25.00, description: 'Precio del servicio' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio: number;

    @ApiProperty({ example: 15, description: 'Duración estimada en minutos' })
    @Column({ type: 'int', default: 15 })
    duracion_min: number;

    @ApiProperty({ type: () => Empresa, description: 'Empresa (clínica) a la que pertenece el servicio' })
    @ManyToOne(() => Empresa, (empresa) => empresa.servicios)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ApiProperty({ example: '2024-06-25T12:00:00.000Z', description: 'Fecha de creación del servicio' })
    @CreateDateColumn({ name: 'created_at' })
    created_at: Date;

    @ApiProperty({ example: '2024-06-25T12:00:00.000Z', description: 'Fecha de actualización del servicio' })
    @CreateDateColumn({ name: 'updated_at' })
    updated_at: Date;

    @OneToMany(() => DetalleHistorial, (detalleHistorial) => detalleHistorial.id_servicio)
    detalle_historial: DetalleHistorial[];

    @BeforeInsert()
    setFechaCreacion() {
        this.created_at = new Date();
    }

    @BeforeUpdate()
    setFechaActualizacion() {
        this.updated_at = new Date();
    }
}
