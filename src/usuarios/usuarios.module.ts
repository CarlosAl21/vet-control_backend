import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';

@Module({
  imports: [],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Exportamos el servicio para que pueda ser utilizado en otros módulos
  // Si necesitas importar otros módulos, puedes hacerlo aquí
})
export class UsuariosModule {}
