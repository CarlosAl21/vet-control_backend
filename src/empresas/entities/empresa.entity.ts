import { Proveedor } from "src/proveedores/entities/proveedor.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Empresa {
    @PrimaryGeneratedColumn('uuid')
    id_empresa: string; // Identificador único de la empresa

    @Column({ type: 'varchar', length: 100 })
    nombre: string; // Nombre de la empresa

    @Column({ type: 'varchar', length: 100 })
    ruc: string; // RUC de la empresa

    @Column({ type: 'varchar', length: 100 })
    direccion: string; // Dirección de la empresa

    @Column({ type: 'varchar', length: 15 })
    telefono: string; // Teléfono de la empresa

    @Column({ type: 'varchar', length: 100 })
    email: string; // Correo electrónico de la empresa

    @OneToMany(() => Proveedor, (proveedor) => proveedor.empresa)
    proveedores: Proveedor[]; // Relación con la entidad Proveedor
}
