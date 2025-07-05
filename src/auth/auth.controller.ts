import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { MailService } from 'src/mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuariosService,
    private readonly mailService: MailService,
  ) {}

  @Post('register')
  // @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombre: { type: 'string', example: 'Juan' },
        apellido: { type: 'string', example: 'Perez' },
        email: { type: 'string', example: 'usuario@mail.com' },
        contraseña: { type: 'string', example: '123456' },
        telefono: { type: 'string', example: '1234567890' },
        direccion: { type: 'string', example: 'Calle Falsa 123' },
        id_empresa: { type: 'string', example: 'empresa-id-123' }, // Si quieres mostrar solo id, cambiar a string
      },
      required: ['nombre', 'apellido', 'email', 'contraseña', 'id_empresa'],
    },
  })
  async register(
    @Body()
    body: {
      nombre: string;
      apellido: string;
      email: string;
      telefono: string;
      direccion: string;
      contraseña: string;
      id_empresa?: Empresa;
      rol?: string;
    },
  ) {
    return this.usuarioService.create(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@mail.com' },
        password: { type: 'string', example: '123456' },
      },
      required: ['email', 'password'],
    },
  })
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.usuarioService.validateUser(
      body.email,
      body.password,
    );
    if (!user) {
      return { error: 'Usuario o contraseña incorrectos' };
    }
    return this.authService.login(user);
  }

  @Post('Logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Request() req) {
    await this.authService.logout(
      req.user.email,
      req.headers.authorization.split(' ')[1],
    );
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('Profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar restablecimiento de contraseña' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@mail.com' },
      },
      required: ['email'],
    },
  })
  async forgotPassword(@Body('email') email: string) {
    const token = uuidv4();
    const saved = await this.usuarioService.saveResetToken(email, token);
    if (saved) {
      await this.mailService.sendPasswordReset(email, { token });
    }
    // Siempre responde igual para no revelar si el email existe
    return { message: 'Si el usuario existe, se envió un correo de reseteo.' };
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Restablecer contraseña con token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'uuid-token-de-reseteo' },
        newPassword: { type: 'string', example: 'NuevaContraseña123' },
      },
      required: ['token', 'newPassword'],
    },
  })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    const result = await this.usuarioService.resetPasswordWithToken(
      body.token,
      body.newPassword,
    );
    if (!result) throw new BadRequestException('Token inválido o expirado');
    return { message: 'Contraseña actualizada correctamente.' };
  }
}
