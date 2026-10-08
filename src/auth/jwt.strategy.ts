import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Request } from "express";
import { UsuariosService } from "src/usuarios/usuarios.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private readonly usuariosService: UsuariosService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.access_token ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET')
        })
    }

    async validate(payload: any) {
        if (typeof payload?.tv !== 'number') {
            throw new UnauthorizedException('Invalid token');
        }
        const tokenVersion = await this.usuariosService.getTokenVersion(payload.sub);
        if (tokenVersion === null || tokenVersion !== payload.tv) {
            throw new UnauthorizedException('Session revoked');
        }
        return { userId: payload.sub, username: payload.username, rol: payload.rol, empresaId: payload.empresaId };
    }
}
