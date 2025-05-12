import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from 'src/empresas/entities/empresa.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Empresa])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], // Exportamos el servicio para que pueda ser utilizado en otros módulos
  // Si necesitas importar otros módulos, puedes hacerlo aquí
})
export class UsuariosModule {}
