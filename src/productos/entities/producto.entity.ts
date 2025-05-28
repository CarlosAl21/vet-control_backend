import { Empresa } from "src/empresas/entities/empresa.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Subcategoria } from "src/subcategorias/entities/subcategoria.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Producto {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del producto' })
    @PrimaryGeneratedColumn('uuid')
    id_producto: string;

    @ApiProperty({ example: 'Croquetas para perro', description: 'Nombre del producto' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ example: 'Alimento balanceado para perros adultos', description: 'Descripción del producto' })
    @Column({ type: 'varchar', length: 100 })
    descripcion: string;

    @ApiProperty({ example: 12.99, description: 'Precio unitario del producto' })
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    precio_unitario: number;

    @ApiProperty({ type: () => Subcategoria, description: 'Subcategoría a la que pertenece el producto' })
    @ManyToOne(() => Subcategoria, (subcategoria) => subcategoria.productos)
    @JoinColumn({ name: 'id_subcategoria' })
    id_subcategoria: Subcategoria; // Relación con la entidad Subcategoria

    @ApiProperty({ type: () => Empresa, description: 'Empresa a la que pertenece el producto' })
    @ManyToOne(() => Empresa, (empresa) => empresa.productos)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa; // Relación con la entidad Empresa

    @ApiProperty({ type: () => [Lote], description: 'Lotes asociados al producto' })
    @OneToMany(() => Lote, (lote) => lote.id_producto)
    lotes: Lote[]; // Relación con la entidad Lote

}
