import { Empresa } from "src/empresas/entities/empresa.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Firmante {
    @ApiProperty({ example: 'uuid', description: 'Unique signer identifier' })
    @PrimaryGeneratedColumn('uuid')
    id_firmante: string;

    @ApiProperty({ example: 'Dra. Ana Pérez', description: 'Signer full name' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ example: 'Directora médica', description: 'Signer position shown on reports' })
    @Column({ type: 'varchar', length: 100 })
    puesto: string;

    @ApiProperty({ example: 1, description: 'Display order on reports (ascending)' })
    @Column({ type: 'int' })
    orden: number;

    @ApiProperty({ type: () => Empresa, description: 'Company that owns the signer' })
    @ManyToOne(() => Empresa)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;
}
