import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Empresa } from 'src/empresas/entities/empresa.entity';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuariosService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'usuario@mail.com' },
        nombre: { type: 'string', example: 'Juan' },
        apellido: { type: 'string', example: 'Perez' },
        contraseña: { type: 'string', example: '123456' },
        id_empresa: { type: 'object', example: { id: 'empresa-id-123' } }, // Si quieres mostrar solo id, cambiar a string
      },
      required: ['email', 'nombre', 'apellido', 'contraseña', 'id_empresa'],
    },
  })
  async register(@Body() body: {email:string, nombre:string, apellido:string, contraseña: string, id_empresa: Empresa}) {
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
  async login(@Body() body: { email: string, password: string }) {
    const user = await this.usuarioService.validateUser(body.email, body.password);
    if (!user) {
      return { error: 'Usuario o contraseña incorrectos' };
    }
    return this.authService.login(user);
  }

  @Post('Logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cerrar sesión' })
  async logout(@Request() req) {
    await this.authService.logout(req.user.email, req.headers.authorization.split(' ')[1]);
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('Profile')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Obtener perfil del usuario autenticado' })
  getProfile(@Request() req) {
    return req.user;
  }
}
