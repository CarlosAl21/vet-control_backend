import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Cita {
    @ApiProperty({ example: 'uuid', description: 'Identificador único de la cita' })
    @PrimaryGeneratedColumn('uuid')
    id_cita: string;

    @ApiProperty({ example: '2024-06-01T10:00:00Z', description: 'Fecha y hora de la cita' })
    @Column({type: Date})
    fecha_hora: Date;

    @ApiProperty({ example: 'Vacunación anual', description: 'Motivo de la cita' })
    @Column({type: 'varchar', length: 250})
    motivo: string;

    @ApiProperty({ example: 'Pendiente', description: 'Estado de la cita' })
    @Column({type: 'varchar', length: 50})
    estado: string;

    @ApiProperty({ type: () => Usuario, description: 'Usuario asociado a la cita' })
    @ManyToOne(() => Usuario, usuario => usuario.citas)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: Usuario;

    @ApiProperty({ type: () => Mascota, description: 'Mascota asociada a la cita' })
    @ManyToOne(() => Mascota, (mascota) => mascota.citas)
    @JoinColumn({ name: 'id_mascota' })
    id_mascota: Mascota;

    @BeforeInsert()
    setEstado() {
        this.estado = 'Pendiente';
    }

    
}
