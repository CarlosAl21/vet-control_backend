import { Inventario } from "src/inventario/entities/inventario.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Producto {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'varchar', length: 100 })
    descripcion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.productos)
    subcategoria: Subcategoria; // Relación con la entidad Subcategoria

    @OneToMany(() => Lote, (lote) => lote.producto)
    lotes: Lote[]; // Relación con la entidad Lote

    @OneToMany(() => Inventario, (inventario) => inventario.producto)
    inventarios: Inventario[]; // Relación con la entidad Inventario
}
