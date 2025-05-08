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
import { InventarioModule } from './inventario/inventario.module';
import { FacturasModule } from './facturas/facturas.module';
import { DetalleFacturaModule } from './detalle_facturas/detalle_facturas.module';
import { Cliente } from './clientes/entities/cliente.entity';
import { Usuario } from './usuarios/entities/usuario.entity';
import { Mascota } from './mascotas/entities/mascota.entity';
import { HistorialesMedico } from './historiales_medicos/entities/historiales_medico.entity';
import { Cita } from './citas/entities/cita.entity';
import { Inventario } from './inventario/entities/inventario.entity';
import { Factura } from './facturas/entities/factura.entity';
import { DetalleFactura } from './detalle_facturas/entities/detalle_factura.entity';
import { CategoriasModule } from './categorias/categorias.module';
import { SubcategoriasModule } from './subcategorias/subcategorias.module';
import { ProductosModule } from './productos/productos.module';
import { LotesModule } from './lotes/lotes.module';
import { ProveedoresModule } from './proveedores/proveedores.module';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true}),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: +(process.env.DB_PORT || 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      entities: [
        Cliente,
        Usuario,
        Mascota,
        HistorialesMedico,
        Cita,
        Inventario,
        Factura,,
        DetalleFactura,
      ],
      synchronize: true,
    }),ClientesModule, UsuariosModule, AuthModule, MascotasModule, HistorialesMedicosModule, CitasModule, InventarioModule, FacturasModule, DetalleFacturaModule, CategoriasModule, SubcategoriasModule, ProductosModule, LotesModule, ProveedoresModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
