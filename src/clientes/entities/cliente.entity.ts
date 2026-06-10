import { Empresa } from "src/empresas/entities/empresa.entity";
import { Factura } from "src/facturas/entities/factura.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from "src/usuarios/entities/usuario.entity";

@Entity()
export class Cliente {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del cliente' })
    @PrimaryGeneratedColumn('uuid')
    id_cliente: string;

    @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
    @Column({ type: 'varchar', length: 100 })
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
    @Column({ type: 'varchar', length: 100 })
    apellido: string;

    @ApiProperty({ example: '0987654321', description: 'Teléfono del cliente', required: false })
    @Column({ type: 'varchar', length: 20, nullable: true })
    telefono: string;

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del cliente', required: false })
    @Column({ type: 'varchar', length: 255, nullable: true })
    direccion: string;

    @ApiProperty({ type: () => Empresa, description: 'Empresa asociada al cliente' })
    @ManyToOne(() => Empresa, (empresa) => empresa.clientes)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;

    @ApiProperty({ type: () => [Factura], description: 'Facturas asociadas al cliente' })
    @OneToMany(() => Factura, factura => factura.cliente)
    facturas: Factura[];

    @ApiProperty({ type: () => Usuario, description: 'Cuenta de usuario vinculada (opcional)', required: false })
    @ManyToOne(() => Usuario, (usuario) => usuario.clientes, { nullable: true })
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: Usuario | null;
}
