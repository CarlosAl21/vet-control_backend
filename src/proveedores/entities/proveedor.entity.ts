import { Lote } from "src/lotes/entities/lote.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @OneToMany(() => Lote, (lote) => lote.proveedor)
    lotes: Lote[]; // Relación con la entidad Lote
}
