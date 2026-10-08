import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuariosService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, pass: string): Promise<any> {
        try {
            const user = await this.usuarioService.validateUser(email, pass);
            if (user) {
                const { password, ...result } = user;
                return result;
            }
            return null;
        } catch (error) {
            console.error('Error al validar usuario:', error);
            throw new InternalServerErrorException('Error al validar usuario');
        }
    }

    async login(user: any) {
        try {
            const fullUser = await this.usuarioService.findOneWithEmpresa(user.id_usuario);
            const payload = {
                username: user.nombre,
                sub: user.id_usuario,
                rol: user.rol,
                empresaId: fullUser?.id_empresa?.id_empresa ?? null,
                tv: fullUser?.token_version ?? 0,
            };
            const token = this.jwtService.sign(payload);

            return {
                access_token: token,
                user: {
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    rol: user.rol,
                    telefono: user.telefono ?? null,
                    direccion: user.direccion ?? null,
                },
            };
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw new InternalServerErrorException('Error al iniciar sesión');
        }
    }

    /**
     * Revokes every token issued to the user by bumping token_version.
     * Logging out on one device therefore logs out all devices.
     */
    async logout(id_usuario: string) {
        try {
            await this.usuarioService.incrementTokenVersion(id_usuario);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw new InternalServerErrorException('Error al cerrar sesión');
        }
    }
}
