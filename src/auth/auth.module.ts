import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Usuario } from 'src/usuarios/entities/usuario.entity';
import { UsuariosModule } from 'src/usuarios/usuarios.module';
import { JwtStrategy } from './jwt.strategy';
import { Empresa } from 'src/empresas/entities/empresa.entity'; // Asegúrate de que la entidad Empresa esté correctamente importada

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Empresa]), // Asegúrate de que la entidad Usuario esté correctamente importada
    ConfigModule,
    UsuariosModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'secretKey'), // Default secret key
        signOptions: { expiresIn: '6h' }, // 60 seconds expiration time
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy], // Exportamos el servicio para que pueda ser utilizado en otros módulos
})
export class AuthModule {}
