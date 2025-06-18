import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { HistorialesMedicosModule } from './historiales_medicos/historiales_medicos.module';
import { CitasModule } from './citas/citas.module';
import { FacturasModule } from './facturas/facturas.module';
import { DetalleFacturaModule } from './detalle_facturas/detalle_facturas.module';
import { Cliente } from './clientes/entities/cliente.entity';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Mascota } from './mascotas/entities/mascota.entity';
import { HistorialesMedico } from './historiales_medicos/entities/historiales_medico.entity';
import { Cita } from './citas/entities/cita.entity';
import { Factura } from './facturas/entities/factura.entity';
import { DetalleFactura } from './detalle_facturas/entities/detalle_factura.entity';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { ProductosModule } from './productos/productos.module';
import { LotesModule } from './lotes/lotes.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { EmpresasModule } from './empresas/empresas.module';
import { Empresa } from './empresas/entities/empresa.entity';
import { Lote } from './lotes/entities/lote.entity';
import { Categoria } from './categorias/entities/categoria.entity';
import { Producto } from './productos/entities/producto.entity';
import { Proveedor } from './proveedores/entities/proveedor.entity';
import { Subcategoria } from './subcategorias/entities/subcategoria.entity';
import { StripeModule } from './stripe/stripe.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MailModule } from './mail/mail.module';
import { FotosHistorialModule } from './fotos_historial/fotos_historial.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: process.env.DB_SCHEMA,
      autoLoadEntities: true,
      entities: [
        Categoria,
        Cita,
        Cliente,
        DetalleFactura,
        Empresa,
        Factura,
        HistorialesMedico,
        Lote,
        Mascota,
        Producto,
        Proveedor,
        Subcategoria,
        Usuario,
      ],
      extra: {
        options: `-c search_path=${process.env.DB_SCHEMA}`,
      },
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      synchronize: true,
    }),
    ClientesModule,
    UsuariosModule,
    AuthModule,
    MascotasModule,
    HistorialesMedicosModule,
    CitasModule,
    FacturasModule,
    DetalleFacturaModule,
    CategoriasModule,
    SubcategoriasModule,
    ProductosModule,
    LotesModule,
    ProveedoresModule,
    EmpresasModule,
    LotesModule,
    StripeModule,
    CloudinaryModule,
    MailModule,
    FotosHistorialModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
