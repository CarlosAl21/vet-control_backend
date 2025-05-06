import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100 })
    nome: string;

    @OneToMany(() => Subcategoria, (subcategoria) => subcategoria.categoria)
    subcategorias: Subcategoria[];
}
