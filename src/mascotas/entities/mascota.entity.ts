import { Cita } from "src/citas/entities/cita.entity";
import { Cliente } from "src/clientes/entities/cliente.entity";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";
import { Column, Double, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { Recordatorio } from "src/recordatorios/entities/recordatorio.entity";
import { IsOptional } from "class-validator";

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

    @ApiProperty({ example: 12.5, description: 'Peso actual de la mascota en kilogramos' })
    @Column({ type: 'float' })
    peso_actual: number;

    @ApiProperty({ example: 'Mediano', description: 'Tamaño de la mascota' })
    @Column({ type: 'varchar', length: 100 })
    tamano: string;

    @IsOptional()
    @ApiProperty({ example: '950098765432100', description: 'Numero de microchip'})
    @Column({type: 'varchar', length: 100})
    num_microchip_collar: string;

    @ApiProperty({ example: 'true', description:'Si la mascota esta eterilizada o no'})
    @Column({type: 'boolean', default: false})
    esterilizado: boolean;

    @ApiProperty({ type: () => Usuario, description: 'Usuario dueño de la mascota' })
    @ManyToOne(() => Usuario, (usuario) => usuario.mascotas)
    @JoinColumn({name: 'id_usuario'})
    id_usuario: Usuario;

    @ApiProperty({ type: () => [HistorialesMedico], description: 'Historiales médicos de la mascota' })
    @OneToMany(() => HistorialesMedico, (historialMedico) => historialMedico.id_mascota)
    historiales_medicos: HistorialesMedico[];

    @ApiProperty({ type: () => [Cita], description: 'Citas asociadas a la mascota' })
    @OneToMany(() => Cita, (cita) => cita.id_mascota)
    citas: Cita[];
    
    @ApiProperty({ type: () => Recordatorio, description: 'Recordatorio asociado a la mascota' })
    @OneToMany(() => Recordatorio, (recordatorio) => recordatorio.id_mascota)
    recordatorios: Recordatorio[];
}
