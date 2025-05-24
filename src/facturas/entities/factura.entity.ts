import { Cliente } from "src/clientes/entities/cliente.entity";
import { DetalleFactura } from "src/detalle_facturas/entities/detalle_factura.entity";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity('facturas')
  export class Factura {
    @PrimaryGeneratedColumn()
    id_factura: number;
  
    @Column({ type: 'date' })
    fecha_emision: Date;
  
    @Column({ type: 'decimal' })
    total: number;
  
    @Column({ type: 'varchar', length: 50 })
    metodo_pago: string;
  
    @ManyToOne(() => Cliente, (cliente) => cliente.facturas)
    cliente: Cliente;

    @ManyToOne(() => Empresa, (empresa) => empresa.facturas)
    id_empresa: Empresa;

    @OneToMany(() => DetalleFactura, (detalle) => detalle.factura)
    detalles: DetalleFactura[];
    
  }
  