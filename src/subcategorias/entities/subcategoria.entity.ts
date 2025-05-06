import { Categoria } from "src/categorias/entities/categoria.entity";
import { Inventario } from "src/inventario/entities/inventario.entity";
import { Column, Entity, In, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Subcategoria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias)
    categoria: Categoria;

    @Column({ type: 'varchar', length: 100 })
    nome: string;

    @OneToMany(() => Inventario, (inventario) => inventario.subcategoria)
    inventarios: Inventario[];

}
