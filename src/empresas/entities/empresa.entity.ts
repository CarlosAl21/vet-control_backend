import { Cliente } from "src/clientes/entities/cliente.entity";
import { Factura } from "src/facturas/entities/factura.entity";
import { Lote } from "src/lotes/entities/lote.entity";
import { Producto } from "src/productos/entities/producto.entity";
import { Proveedor } from "src/proveedores/entities/proveedor.entity";
import { Usuario } from "src/usuarios/entities/usuario.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Servicio } from "src/servicios/entities/servicio.entity";
import { HistorialesMedico } from "src/historiales_medicos/entities/historiales_medico.entity";

@Entity()
export class Empresa {
    @ApiProperty({ example: 'uuid', description: 'Identificador único de la empresa' })
    @PrimaryGeneratedColumn('uuid')
    id_empresa: string; // Identificador único de la empresa

    @ApiProperty({ example: 'Veterinaria Central', description: 'Nombre de la empresa' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string; // Nombre de la empresa

    @ApiProperty({ example: '1234567890001', description: 'RUC de la empresa' })
    @Column({ type: 'varchar', length: 100 })
    ruc: string; // RUC de la empresa

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección de la empresa' })
    @Column({ type: 'varchar', length: 100 })
    direccion: string; // Dirección de la empresa

    @ApiProperty({ example: '0999999999', description: 'Teléfono de la empresa' })
    @Column({ type: 'varchar', length: 15 })
    telefono: string; // Teléfono de la empresa

    @ApiProperty({ example: 'empresa@email.com', description: 'Correo electrónico de la empresa' })
    @Column({ type: 'varchar', length: 100 })
    email: string; // Correo electrónico de la empresa

    @ApiProperty({ example: '2023-01-01', description: 'Fecha de creación de la empresa' })
    @Column({ type: 'date', nullable: true })
    fecha_creacion: Date; // Fecha de creación de la empresa

    @ApiProperty({ example: '2023-01-01', description: 'Fecha de actualización de la empresa' })
    @Column({ type: 'date', nullable: true })
    fecha_actualizacion: Date; // Fecha de actualización de la empresa

    @ApiProperty({ type: () => [Proveedor], description: 'Proveedores asociados a la empresa' })
    @OneToMany(() => Proveedor, (proveedor) => proveedor.id_empresa)
    proveedores: Proveedor[]; // Relación con la entidad Proveedor

    @ApiProperty({ type: () => [Factura], description: 'Facturas asociadas a la empresa' })
    @OneToMany(() => Factura, (factura) => factura.id_empresa)
    facturas: Factura[]; // Relación con la entidad Factura

    @ApiProperty({ type: () => [Cliente], description: 'Clientes asociados a la empresa' })
    @OneToMany(() => Cliente, (cliente) => cliente.id_empresa)
    clientes: Cliente[]; // Relación con la entidad Cliente
    
    @ApiProperty({ type: () => [Usuario], description: 'Usuarios asociados a la empresa' })
    @OneToMany(() => Usuario, (usuario) => usuario.id_empresa)
    usuarios: Usuario[]; // Relación con la entidad Usuario

    @ApiProperty({ type: () => [Producto], description: 'Productos asociados a la empresa' })
    @OneToMany(() => Producto, (producto) => producto.id_empresa)
    productos: Producto[]; // Relación con la entidad Productos

    @ApiProperty({ type: () => [Lote], description: 'Lotes asociados a la empresa' })
    @OneToMany(() => Lote, (lote) => lote.id_empresa)
    lotes: Lote[]; // Relación con la entidad Lote

    @ApiProperty({ type: () => [Servicio], description: 'Servicios asociados a la empresa' })
    @OneToMany(() => Servicio, (servicio) => servicio.id_empresa)
    servicios: Servicio[]; // Relación con la entidad Servicio

    @ApiProperty({ type: () => [HistorialesMedico], description: 'Historiales médicos asociados a la empresa' })
    @OneToMany(() => HistorialesMedico, (historial) => historial.id_empresa)
    historiales_medicos: HistorialesMedico[]; // Relación con la entidad HistorialesMedico

    @BeforeInsert()
    setFechaCreacion() {
        this.fecha_creacion = new Date();
    }

    @BeforeUpdate()
    setFechaActualizacion() {
        this.fecha_actualizacion = new Date();
    }
}

