import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Usuario } from './usuarios/entities/usuario.entity'; // agrega más entidades si las tienes
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { HistorialesMedicosModule } from './historiales_medicos/historiales_medicos.module';
import { InventarioModule } from './inventario/inventario.module';
import { CitasModule } from './citas/citas.module';
import { LotesModule } from './lotes/lotes.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { FacturasModule } from './facturas/facturas.module';
import { DetalleFacturaModule } from './detalle_facturas/detalle_facturas.module';
import { StripeModule } from './stripe/stripe.module';

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
    FacturasModule,
    HistorialesMedicosModule,
    CitasModule,
    DetalleFacturaModule,
    InventarioModule,
    LotesModule,
    StripeModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}