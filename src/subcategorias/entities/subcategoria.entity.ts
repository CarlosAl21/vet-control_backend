import { Categoria } from "src/categorias/entities/categoria.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, In, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Subcategoria {
    @PrimaryGeneratedColumn('uuid')
    id_subcategoria: string;

    @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias)
    categoria: Categoria;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => Producto, (producto) => producto.subcategoria)
    productos: Producto[];

}
