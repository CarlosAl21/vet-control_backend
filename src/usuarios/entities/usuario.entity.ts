
import { BeforeInsert, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cita } from 'src/citas/entities/cita.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn('uuid')
    id_usuario: string;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @Column({ type: 'varchar', length: 50 })
    apellido: string;

    @Column({ type: 'varchar', length: 50 })
    email: string;

    @Column({ type: 'varchar', length: 50 })
    contraseña: string;

    @Column({ type: 'varchar', length: 50 })
    rol: string;

    @ManyToOne(() => Empresa, (empresa) => empresa.usuarios)
    id_empresa: Empresa;

    @OneToMany(() => Cita, (citas) => citas.usuario)
    citas: Cita[];

    @BeforeInsert()
    async hashPassword() {
        const salteRound = 10;
        this.contraseña = await bcrypt.hash(this.contraseña, salteRound);
    }

    @BeforeInsert()
    async defualtRol() {
        if (!this.rol) {
            this.rol = 'usuario';
        }
    }
}
