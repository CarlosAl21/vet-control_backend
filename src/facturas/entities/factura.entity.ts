import { Cliente } from "src/clientes/entities/cliente.entity";
import { DetalleFactura } from "src/detalle_facturas/entities/detalle_factura.entity";
import { Empresa } from "src/empresas/entities/empresa.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';

@Entity('facturas')
  export class Factura {
    @ApiProperty({ example: 1, description: 'Identificador único de la factura' })
    @PrimaryGeneratedColumn()
    id_factura: number;
  
    @ApiProperty({ example: '2024-06-01', description: 'Fecha de emisión de la factura' })
    @Column({ type: 'date' })
    fecha_emision: Date;
  
    @ApiProperty({ example: 150.75, description: 'Total de la factura' })
    @Column({ type: 'decimal' })
    total: number;
  
    @ApiProperty({ example: 'Efectivo', description: 'Método de pago utilizado' })
    @Column({ type: 'varchar', length: 50 })
    metodo_pago: string;
  
    @ManyToOne(() => Cliente, cliente => cliente.facturas, { eager: true })
    @JoinColumn({ name: 'id_cliente' })
    cliente: Cliente;

    @ApiProperty({ type: () => Empresa, description: 'Empresa asociada a la factura' })
    @ManyToOne(() => Empresa, (empresa) => empresa.facturas)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ApiProperty({ type: () => [DetalleFactura], description: 'Detalles de la factura' })
    @OneToMany(() => DetalleFactura, (detalle) => detalle.id_factura, { eager: true})
    detalles: DetalleFactura[];

    @Column({ type: 'enum', enum: ['pagado', 'pendiente', 'anulado', 'vencido'], default: 'pendiente' })
    estado: 'pagado' | 'pendiente' | 'anulado' | 'vencido';
  }
