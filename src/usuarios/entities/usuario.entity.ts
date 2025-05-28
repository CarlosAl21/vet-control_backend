import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cita } from 'src/citas/entities/cita.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Usuario {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del usuario' })
    @PrimaryGeneratedColumn('uuid')
    id_usuario: string;

    @ApiProperty({ example: 'Juan', description: 'Nombre del usuario' })
    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del usuario' })
    @Column({ type: 'varchar', length: 50 })
    apellido: string;

    @ApiProperty({ example: 'juan.perez@email.com', description: 'Correo electrónico del usuario' })
    @Column({ type: 'varchar', length: 50 })
    email: string;

    @ApiProperty({ example: 'hashed_password', description: 'Contraseña del usuario (encriptada)' })
    @Column({ type: 'varchar', length: 255 })
    contraseña: string;

    @ApiProperty({ example: 'usuario', description: 'Rol del usuario' })
    @Column({ type: 'varchar', length: 50 })
    rol: string;

    @ApiProperty({ type: () => Empresa, description: 'Empresa a la que pertenece el usuario' })
    @ManyToOne(() => Empresa, (empresa) => empresa.usuarios)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ApiProperty({ type: () => [Cita], description: 'Citas asociadas al usuario' })
    @OneToMany(() => Cita, (citas) => citas.id_usuario)
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
