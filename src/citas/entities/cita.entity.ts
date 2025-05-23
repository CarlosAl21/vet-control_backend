import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { BeforeInsert, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cita {
    @PrimaryGeneratedColumn('uuid')
    id_cita: string;

    @Column({type: Date})
    fecha_hora: Date;

    @Column({type: 'varchar', length: 250})
    motivo: string;

    @Column({type: 'varchar', length: 50})
    estado: string;

    @ManyToOne(() => Usuario, usuario => usuario.citas)
    usuario: Usuario;

    @ManyToOne(() => Mascota, (mascota) => mascota.citas)
    mascota: Mascota;

    @BeforeInsert()
    setEstado() {
        this.estado = 'Pendiente';
    }

    
}
