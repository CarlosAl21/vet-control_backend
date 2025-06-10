import { Empresa } from "src/empresas/entities/empresa.entity";
import { Factura } from "src/facturas/entities/factura.entity";
import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

    @ManyToOne(() => Empresa, (empresa) => empresa.clientes)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;
    
    @OneToMany(() => Mascota, (mascota) => mascota.cliente)
    mascotas: Mascota[];
    
    @OneToMany(() => Factura, factura => factura.cliente)
    facturas: Factura[];
}
