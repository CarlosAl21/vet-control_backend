import { Producto } from "src/productos/entities/producto.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Inventario {
    @PrimaryGeneratedColumn('uuid')
    id_inventario: string;

    @ManyToOne(() => Producto, (producto) => producto.inventarios)
    producto: Producto;

    @Column({ type: 'int' })
    stock: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

}
