import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Inventario {
    @PrimaryGeneratedColumn('uuid')
    id_producto: string;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @Column({ type: 'varchar', length: 100 })
    descripcion: string;

    @Column({ type: 'int' })
    stock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.inventarios)
    subcategoria: Subcategoria;
}
