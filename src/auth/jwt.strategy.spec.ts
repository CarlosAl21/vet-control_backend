import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { UsuariosService } from 'src/usuarios/usuarios.service';

// Avoid loading jsonwebtoken (fails on Node >= 25); only validate() is under test
jest.mock('passport-jwt', () => ({
  Strategy: class Strategy {
    name = 'jwt';
    constructor(_options: unknown, _verify: unknown) {}
  },
  ExtractJwt: {
    fromExtractors: () => () => null,
    fromAuthHeaderAsBearerToken: () => () => null,
  },
}));

describe('JwtStrategy.validate', () => {
  const basePayload = {
    sub: 'user-1',
    username: 'Juan',
    rol: 'admin',
    empresaId: 'empresa-1',
  };
  let usuariosService: { getTokenVersion: jest.Mock };
  let strategy: JwtStrategy;

  beforeEach(() => {
    usuariosService = { getTokenVersion: jest.fn() };
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
      getOrThrow: jest.fn().mockReturnValue('test-secret'),
    } as unknown as ConfigService;
    strategy = new JwtStrategy(
      configService,
      usuariosService as unknown as UsuariosService,
    );
  });

  it('returns the user when tv matches the stored token_version', async () => {
    usuariosService.getTokenVersion.mockResolvedValue(3);

    await expect(strategy.validate({ ...basePayload, tv: 3 })).resolves.toEqual({
      userId: 'user-1',
      username: 'Juan',
      rol: 'admin',
      empresaId: 'empresa-1',
    });
    expect(usuariosService.getTokenVersion).toHaveBeenCalledWith('user-1');
  });

  it('rejects when tv differs from the stored token_version', async () => {
    usuariosService.getTokenVersion.mockResolvedValue(4);

    await expect(
      strategy.validate({ ...basePayload, tv: 3 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects tokens without a tv claim', async () => {
    usuariosService.getTokenVersion.mockResolvedValue(0);

    await expect(strategy.validate(basePayload)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects when the user no longer exists', async () => {
    usuariosService.getTokenVersion.mockResolvedValue(null);

    await expect(
      strategy.validate({ ...basePayload, tv: 0 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
