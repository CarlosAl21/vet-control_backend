import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MascotasModule } from './mascotas/mascotas.module';
import { HistorialesMedicosModule } from './historiales_medicos/historiales_medicos.module';
import { CitasModule } from './citas/citas.module';
import { InventarioModule } from './inventario/inventario.module';
<<<<<<< HEAD

@Module({
  imports: [ClientesModule, UsuariosModule, AuthModule, MascotasModule, HistorialesMedicosModule, CitasModule, InventarioModule],
=======
import { FacturasModule } from './facturas/facturas.module';
import { DetalleFacturasModule } from './detalle_facturas/detalle_facturas.module';

@Module({
  imports: [ClientesModule, UsuariosModule, AuthModule, MascotasModule, HistorialesMedicosModule, CitasModule, InventarioModule, FacturasModule, DetalleFacturasModule],
>>>>>>> 2af48dc (Agregar entidad DetalleFactura y Facturas y relaciones con Factura)
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
