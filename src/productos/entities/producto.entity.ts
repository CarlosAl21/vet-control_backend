import { Empresa } from "src/empresas/entities/empresa.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn('uuid')
    id_producto: string;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'varchar', length: 100 })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.productos)
    subcategoria: Subcategoria; // Relación con la entidad Subcategoria

    @ManyToOne(() => Empresa, (empresa) => empresa.productos)
    id_empresa: Empresa; // Relación con la entidad Empresa

    @OneToMany(() => Lote, (lote) => lote.id_producto)
    lotes: Lote[]; // Relación con la entidad Lote

}
