import { Cliente } from "src/clientes/entities/cliente.entity";
import { Factura } from "src/facturas/entities/factura.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
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

    @OneToMany(() => Proveedor, (proveedor) => proveedor.id_empresa)
    proveedores: Proveedor[]; // Relación con la entidad Proveedor

    @OneToMany(() => Factura, (factura) => factura.id_empresa)
    facturas: Factura[]; // Relación con la entidad Factura

    @OneToMany(() => Cliente, (cliente) => cliente.id_empresa)
    clientes: Cliente[]; // Relación con la entidad Cliente
    
    @OneToMany(() => Usuario, (usuario) => usuario.id_empresa)
    usuarios: Usuario[]; // Relación con la entidad Usuario

    @OneToMany(() => Producto, (producto) => producto.id_empresa)
    productos: Producto[]; // Relación con la entidad Productos

    @OneToMany(() => Lote, (lote) => lote.id_empresa)
    lotes: Lote[]; // Relación con la entidad Lote
}
