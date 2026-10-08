import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Categoria {
    @ApiProperty({ example: 'uuid', description: 'Identificador único de la categoría' })
    @PrimaryGeneratedColumn('uuid')
    id_categoria: string;

    @ApiProperty({ example: 'Alimentos', description: 'Nombre de la categoría' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ type: () => [Subcategoria], description: 'Subcategorías asociadas a la categoría' })
    @OneToMany(() => Subcategoria, (subcategoria) => subcategoria.id_categoria)
    subcategorias: Subcategoria[];
}
