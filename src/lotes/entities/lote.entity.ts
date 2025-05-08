import { Producto } from "src/productos/entities/producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Lote {
    @PrimaryGeneratedColumn('uuid')
    id_lote: string; // Identificador único del lote

    @Column({ type: 'date' })
    fecha_ingreso: Date; // Fecha de ingreso del lote

    @Column({ type: 'date'})
    fecha_vencimiento: Date; // Fecha de vencimiento del lote

    @Column({ type: 'int' })
    cantidad: number; // Cantidad de productos en el lote

    @ManyToOne(() => Producto, (producto) => producto.lotes)
    producto: Producto; // Relación con la entidad Producto

    @ManyToOne(() => Proveedor, (proveedor) => proveedor.lotes)
    proveedor: Proveedor; // Relación con la entidad Proveedor
}
