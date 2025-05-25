import { Categoria } from "src/categorias/entities/categoria.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, In, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Subcategoria {
    @PrimaryGeneratedColumn('uuid')
    id_subcategoria: string;

    @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias)
    @JoinColumn({ name: 'id_categoria' })
    id_categoria: Categoria;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => Producto, (producto) => producto.id_subcategoria)
    productos: Producto[];

}
