import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Cita } from 'src/citas/entities/cita.entity';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Cliente } from 'src/clientes/entities/cliente.entity';
import { IsOptional } from 'class-validator';
import { Mascota } from 'src/mascotas/entities/mascota.entity';

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
    @Column({ type: 'varchar', length: 50, unique: true })
    email: string;

    @ApiProperty({ example: '0987654321', description: 'Número de teléfono del usuario' })
    @Column({ type: 'varchar', length: 15 })
    telefono: string;
    
    @ApiProperty({ example: '123 Main St', description: 'Dirección del usuario' })
    @Column({ type: 'varchar', length: 255 })
    direccion: string;

    @ApiProperty({ example: 'hashed_password', description: 'Contraseña del usuario (encriptada)' })
    @Column({ type: 'varchar', length: 255 })
    contraseña: string;

    @ApiProperty({ example: 'usuario', description: 'Rol del usuario' })
    @Column({ type: 'varchar', length: 50 })
    rol: string;

    @ApiProperty({ type: () => Empresa, description: 'Empresa a la que pertenece el usuario' })
    @ManyToOne(() => Empresa, (empresa) => empresa.usuarios)
    @ApiProperty({ example: 'uuid', description: 'Identificador de la empresa' })
    @IsOptional()
    @JoinColumn({ name: 'id_empresa' })
    id_empresa?: Empresa;

    @ApiProperty({ type: () => [Cita], description: 'Citas asociadas al usuario' })
    @OneToMany(() => Cita, (citas) => citas.id_usuario)
    citas: Cita[];

    @OneToMany(() => Cliente, (cliente) => cliente.id_usuario)
    clientes: Cliente[];

    @OneToMany(() => Mascota, (mascota) => mascota.id_usuario)
    mascotas: Mascota[];

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
