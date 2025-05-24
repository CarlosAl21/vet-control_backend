import { Empresa } from "src/empresas/entities/empresa.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Proveedor {
    @PrimaryGeneratedColumn('uuid')
    id_proveedor: string; // Identificador único del proveedor

    @Column({ type: 'varchar', length: 100 })
    nombre: string; // Nombre del proveedor

    @Column({ type: 'varchar', length: 100 })
    direccion: string; // Dirección del proveedor

    @Column({ type: 'varchar', length: 15 })
    telefono: string; // Teléfono del proveedor

    @Column({ type: 'varchar', length: 100 })
    email: string; // Correo electrónico del proveedor

    @ManyToOne(() => Empresa, (empresa) => empresa.proveedores)
    empresa: Empresa; // Relación con la entidad Empresa

    @OneToMany(() => Lote, (lote) => lote.id_proveedor)
    lotes: Lote[]; // Relación con la entidad Lote
}
