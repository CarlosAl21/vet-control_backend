import { Cita } from "src/citas/entities/cita.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Mascota {
    @ApiProperty({ example: 'uuid', description: 'Identificador único de la mascota' })
    @PrimaryGeneratedColumn('uuid')
    id_mascota: string;

    @ApiProperty({ example: 'Firulais', description: 'Nombre de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @ApiProperty({ example: 'Perro', description: 'Especie de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    especie: string;

    @ApiProperty({ example: 'Labrador', description: 'Raza de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    raza: string;

    @ApiProperty({ example: 'Macho', description: 'Sexo de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    sexo: string;

    @ApiProperty({ example: '2018-05-20', description: 'Fecha de nacimiento de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    fecha_nacimiento: string;

    @ApiProperty({ example: 'Negro', description: 'Color de la mascota' })
    @Column({ type: 'varchar', length: 50 })
    color: string;

    @ApiProperty({ type: () => Cliente, description: 'Cliente dueño de la mascota' })
    @ManyToOne(() => Cliente, (cliente) => cliente.mascotas)
    cliente: Cliente;

    @ApiProperty({ type: () => [HistorialesMedico], description: 'Historiales médicos de la mascota' })
    @OneToMany(() => HistorialesMedico, (historialMedico) => historialMedico.id_mascota)
    historiales_medicos: HistorialesMedico[];

    @ApiProperty({ type: () => [Cita], description: 'Citas asociadas a la mascota' })
    @OneToMany(() => Cita, (cita) => cita.id_mascota)
    citas: Cita[];
}
