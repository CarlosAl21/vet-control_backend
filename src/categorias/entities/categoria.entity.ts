import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn('uuid')
    id_categoria: string;

    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @OneToMany(() => Subcategoria, (subcategoria) => subcategoria.id_categoria)
    subcategorias: Subcategoria[];
}
