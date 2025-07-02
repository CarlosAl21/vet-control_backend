import { Empresa } from "src/empresas/entities/empresa.entity";
import { Factura } from "src/facturas/entities/factura.entity";
import { Mascota } from "src/mascotas/entities/mascota.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from '@nestjs/swagger';
import { Usuario } from "src/usuarios/entities/usuario.entity";

@Entity()
export class Cliente {
    @ApiProperty({ example: 'uuid', description: 'Identificador único del cliente' })
    @PrimaryGeneratedColumn('uuid')
    id_cliente: string;

    @ApiProperty({ example: 'Juan', description: 'Nombre del cliente' })
    @Column({ type: 'varchar', length: 50 })
    nombre: string;

    @ApiProperty({ example: 'Pérez', description: 'Apellido del cliente' })
    @Column({ type: 'varchar', length: 50 })
    apellido: string;

    @ApiProperty({ example: 'juan@email.com', description: 'Correo electrónico del cliente' })
    @Column({ type: 'varchar', length: 50 })
    email: string;

    @ApiProperty({ example: '0999999999', description: 'Teléfono del cliente' })
    @Column({ type: 'varchar', length: 50 })
    telefono: string;

    @ApiProperty({ example: 'Av. Principal 123', description: 'Dirección del cliente' })
    @Column({ type: 'varchar', length: 50 })
    direccion: string;

    @ApiProperty({ type: () => Empresa, description: 'Empresa asociada al cliente' })
    @ManyToOne(() => Empresa, (empresa) => empresa.clientes)
    @JoinColumn({ name: 'id_empresa' })
    id_empresa: Empresa;
    
    @ApiProperty({ type: () => [Factura], description: 'Facturas asociadas al cliente' })
    @OneToMany(() => Factura, factura => factura.cliente)
    facturas: Factura[];

    @ApiProperty({ type: () => Usuario, description: 'Usuario asociado al cliente' })
    @ManyToOne(() => Usuario, (usuario) => usuario.clientes)
    @JoinColumn({ name: 'id_usuario' })
    id_usuario: Usuario;
}
