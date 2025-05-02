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

@Module({
  imports: [ClientesModule, UsuariosModule, AuthModule, MascotasModule, HistorialesMedicosModule, CitasModule, InventarioModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
