import { Empresa } from "src/empresas/entities/empresa.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Proveedor {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del proveedor' })
    @PrimaryGeneratedColumn('uuid')
    id_proveedor: string; // Identificador único del proveedor

    @ApiProperty({ example: 'Proveedor S.A.', description: 'Nombre del proveedor' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string; // Nombre del proveedor

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del proveedor' })
    @Column({ type: 'varchar', length: 100 })
    direccion: string; // Dirección del proveedor

    @ApiProperty({ example: '0999999999', description: 'Teléfono del proveedor' })
    @Column({ type: 'varchar', length: 15 })
    telefono: string; // Teléfono del proveedor

    @ApiProperty({ example: 'proveedor@email.com', description: 'Correo electrónico del proveedor' })
    @Column({ type: 'varchar', length: 100 })
    email: string; // Correo electrónico del proveedor

    @ApiProperty({ type: () => Empresa, description: 'Empresa a la que pertenece el proveedor' })
    @ManyToOne(() => Empresa, (empresa) => empresa.proveedores)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa; // Relación con la entidad Empresa

    @ApiProperty({ type: () => [Lote], description: 'Lotes asociados al proveedor' })
    @OneToMany(() => Lote, (lote) => lote.id_proveedor)
    lotes: Lote[]; // Relación con la entidad Lote
}
