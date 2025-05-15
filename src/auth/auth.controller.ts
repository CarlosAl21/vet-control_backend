import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Empresa } from 'src/empresas/entities/empresa.entity'; // Asegúrate de que la entidad Empresa esté correctamente importada

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usuarioService: UsuariosService , // Inyectar el servicio de autenticación
  ) {}

  @Post('register')
  async register(@Body() body: {email:string, nombre:string, apellido:string, contraseña: string, id_empresa: Empresa}) {
    return this.usuarioService.create(body); // Llama al servicio de usuario para crear un nuevo usuario
  }

  @Post('login')
  async login(@Body() body: { email: string, password: string }) {
    const user = await this.usuarioService.validateUser(body.email, body.password); // Llama al servicio de usuario para validar el usuario
    if (!user) {
      return { error: 'Usuario o contraseña incorrectos' };
    }
    return this.authService.login(user); // Llama al servicio de autenticación para generar el token
  }

  @Post('Logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Request() req) {
    await this.authService.logout(req.user.email, req.headers.authorization.split(' ')[1]);
    return { message: 'Sesión cerrada correctamente' };
  }

  @Post('Profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }
}
