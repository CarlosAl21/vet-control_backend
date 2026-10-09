import { ConfigService } from '@nestjs/config';
import { durationToMs, getJwtExpiresIn, getJwtSecret } from './jwt.config';

const configWith = (values: Record<string, string | undefined>) =>
  ({ get: (key: string) => values[key] }) as unknown as ConfigService;

describe('jwt.config', () => {
  it('getJwtSecret throws when JWT_SECRET is missing or blank', () => {
    expect(() => getJwtSecret(configWith({}))).toThrow(/JWT_SECRET/);
    expect(() => getJwtSecret(configWith({ JWT_SECRET: '  ' }))).toThrow(
      /JWT_SECRET/,
    );
    expect(getJwtSecret(configWith({ JWT_SECRET: 'abc' }))).toBe('abc');
  });

  it('getJwtExpiresIn defaults to 6h and rejects invalid values', () => {
    expect(getJwtExpiresIn(configWith({}))).toBe('6h');
    expect(getJwtExpiresIn(configWith({ JWT_EXPIRES_IN: '30m' }))).toBe('30m');
    expect(() =>
      getJwtExpiresIn(configWith({ JWT_EXPIRES_IN: '6 hours' })),
    ).toThrow(/JWT_EXPIRES_IN/);
  });

  it('durationToMs converts supported units', () => {
    expect(durationToMs('45s')).toBe(45_000);
    expect(durationToMs('30m')).toBe(1_800_000);
    expect(durationToMs('6h')).toBe(21_600_000);
    expect(durationToMs('7d')).toBe(604_800_000);
    expect(() => durationToMs('0h')).toThrow();
    expect(() => durationToMs('3600')).toThrow();
  });
});
