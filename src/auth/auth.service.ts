import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from 'src/usuarios/usuarios.service';

@Injectable()
export class AuthService {
    private activeSessions = new Map<string, string[]>(); 

    constructor(
        private usuarioService: UsuariosService ,
        private jwtService: JwtService,
    ) {
        this.startTokenCleanup();
    }

    // Función para iniciar la limpieza automática
    private startTokenCleanup() {
        setInterval(() => {
            console.log('Limpiando tokens expirados...');
            // Recorremos el mapa y limpiamos los tokens expirados
            for (const [id_usuario, tokens] of this.activeSessions.entries()) {
                const validTokens = tokens.filter(token => {
                    try {
                        this.jwtService.verify(token); // Verificamos si el token está expirado
                        return true; // Si el token es válido, lo mantenemos
                    } catch (e) {
                        console.log('Token expirado:', token);
                        return false; // Si el token expiró, lo eliminamos
                    }
                });

                if (validTokens.length > 0) {
                    this.activeSessions.set(id_usuario, validTokens);
                } else {
                    this.activeSessions.delete(id_usuario); // Eliminar la entrada si no hay tokens válidos
                }
            }
        }, 3600000); // Cada 1 hora (3600000 ms)
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usuarioService.validateUser(email, pass);
        
        if (user) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.nombre, sub: user.id_usuario, rol: user.rol };
        const token = this.jwtService.sign(payload);
        // Guardar sesión en la lista de sesiones activas
        if (!this.activeSessions.has(user.id_usuario)) {
            this.activeSessions.set(user.id_usuario, []);
        }
        this.activeSessions.get(user.id_usuario)?.push(token);

        return { access_token: token };
    }
    
    async logout(id: string, token: string) {
        const tokens = this.activeSessions.get(id);
        if (tokens) {
            this.activeSessions.set(id, tokens.filter(t => t !== token));
        }
    }

    getActiveSessions() {
        return this.activeSessions;
    }
}
