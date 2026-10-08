import { JwtService } from '@nestjs/jwt';
// jsonwebtoken cannot load on Node >= 25 (removed SlowBuffer); JwtService is mocked anyway
jest.mock('@nestjs/jwt', () => ({ JwtService: class JwtService {} }));
import { AuthService } from './auth.service';
import { UsuariosService } from 'src/usuarios/usuarios.service';

describe('AuthService', () => {
  let usuariosService: {
    findOneWithEmpresa: jest.Mock;
    incrementTokenVersion: jest.Mock;
  };
  let jwtService: { sign: jest.Mock };
  let service: AuthService;

  beforeEach(() => {
    usuariosService = {
      findOneWithEmpresa: jest.fn(),
      incrementTokenVersion: jest.fn().mockResolvedValue(undefined),
    };
    jwtService = { sign: jest.fn().mockReturnValue('signed-token') };
    service = new AuthService(
      usuariosService as unknown as UsuariosService,
      jwtService as unknown as JwtService,
    );
  });

  it('includes the current token_version as tv in the JWT payload', async () => {
    usuariosService.findOneWithEmpresa.mockResolvedValue({
      id_usuario: 'user-1',
      token_version: 2,
      id_empresa: { id_empresa: 'empresa-1' },
    });

    const result = await service.login({
      id_usuario: 'user-1',
      nombre: 'Juan',
      rol: 'admin',
    });

    expect(result.access_token).toBe('signed-token');
    expect(jwtService.sign).toHaveBeenCalledWith({
      username: 'Juan',
      sub: 'user-1',
      rol: 'admin',
      empresaId: 'empresa-1',
      tv: 2,
    });
  });

  it('logout increments the user token_version', async () => {
    await service.logout('user-1');

    expect(usuariosService.incrementTokenVersion).toHaveBeenCalledWith(
      'user-1',
    );
  });
});
