import { Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';
import { Redis } from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.provider';

const SESSION_TTL_SECONDS = 86400; // 24 hours — align with JWT expiry

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuariosService,
        private jwtService: JwtService,
        @Inject(REDIS_CLIENT) private redis: Redis,
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
            };
            const token = this.jwtService.sign(payload);

            const sessionKey = `sessions:${user.id_usuario}`;
            await this.redis.sadd(sessionKey, token);
            await this.redis.expire(sessionKey, SESSION_TTL_SECONDS);

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

    async logout(id_usuario: string, token: string) {
        try {
            await this.redis.srem(`sessions:${id_usuario}`, token);
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            throw new InternalServerErrorException('Error al cerrar sesión');
        }
    }
}
