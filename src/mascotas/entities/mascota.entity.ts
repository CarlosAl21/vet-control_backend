import { Cita } from "src/citas/entities/cita.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Mascota {
    @PrimaryGeneratedColumn('uuid')
    id_mascota: string;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @Column({ type: 'varchar', length: 50 })
    especie: string;

    @Column({ type: 'varchar', length: 50 })
    raza: string;

    @Column({ type: 'varchar', length: 50 })
    sexo: string;

    @Column({ type: 'varchar', length: 50 })
    fecha_nacimiento: string;

    @Column({ type: 'varchar', length: 50 })
    color: string;

    @ManyToOne(() => Cliente, (cliente) => cliente.mascotas)
    cliente: Cliente;

    @OneToMany(() => HistorialesMedico, (historialMedico) => historialMedico.id_mascota)
    historiales_medicos: HistorialesMedico[];

    @OneToMany(() => Cita, (cita) => cita.id_mascota)
    citas: Cita[];
}
