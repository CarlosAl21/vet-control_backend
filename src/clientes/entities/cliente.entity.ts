<<<<<<< HEAD
=======
import { Factura } from "src/facturas/entities/factura.entity";
>>>>>>> 2af48dc (Agregar entidad DetalleFactura y Facturas y relaciones con Factura)
import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Cliente {
    @PrimaryGeneratedColumn('uuid')
    id_cliente: string;

    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @Column({ type: 'varchar', length: 50 })
    apellido: string;

    @Column({ type: 'varchar', length: 50 })
    email: string;

    @Column({ type: 'varchar', length: 50 })
    telefono: string;

    @Column({ type: 'varchar', length: 50 })
    direccion: string;
    
    @OneToMany(() => Mascota, (mascota) => mascota.cliente)
    mascotas: Mascota[];
<<<<<<< HEAD
=======

    @OneToMany(() => Factura, (factura) => factura.cliente)
    facturas: Factura[];
>>>>>>> 2af48dc (Agregar entidad DetalleFactura y Facturas y relaciones con Factura)
}
