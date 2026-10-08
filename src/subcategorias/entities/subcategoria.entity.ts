import { Categoria } from "src/categorias/entities/categoria.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Column, Entity, In, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Subcategoria {
    @ApiProperty({ example: 'uuid', description: 'Identificador único de la subcategoría' })
    @PrimaryGeneratedColumn('uuid')
    id_subcategoria: string;

    @ApiProperty({ type: () => Categoria, description: 'Categoría a la que pertenece la subcategoría' })
    @ManyToOne(() => Categoria, (categoria) => categoria.subcategorias)
    @JoinColumn({ name: 'id_categoria' })
    id_categoria: Categoria;

    @ApiProperty({ example: 'Alimentos', description: 'Nombre de la subcategoría' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ type: () => [Producto], description: 'Productos asociados a la subcategoría' })
    @OneToMany(() => Producto, (producto) => producto.id_subcategoria)
    productos: Producto[];
}
