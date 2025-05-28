import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { HistorialesMedicosModule } from './historiales_medicos/historiales_medicos.module';
import { CitasModule } from './citas/citas.module';
import { FacturasModule } from './facturas/facturas.module';
import { DetalleFacturaModule } from './detalle_facturas/detalle_facturas.module';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { ProductosModule } from './productos/productos.module';
import { LotesModule } from './lotes/lotes.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { EmpresasModule } from './empresas/empresas.module';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [join(__dirname, '**/*.entity{.ts,.js}')],
      synchronize: true, // Solo para desarrollo
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
