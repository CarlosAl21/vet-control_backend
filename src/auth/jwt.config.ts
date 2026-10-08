import { ConfigService } from '@nestjs/config';

export const DEFAULT_JWT_EXPIRES_IN = '6h';

const DURATION_PATTERN = /^(\d+)([smhd])$/;
const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Reads JWT_SECRET and throws when it is missing, so the app refuses to boot
 * instead of signing tokens with an insecure default. Used by both signing
 * (JwtModule) and verification (JwtStrategy).
 */
export function getJwtSecret(configService: ConfigService): string {
  const secret = configService.get<string>('JWT_SECRET');
  if (!secret || secret.trim() === '') {
    throw new Error(
      'JWT_SECRET environment variable is required but was not set.',
    );
  }
  return secret;
}

/**
 * Reads JWT_EXPIRES_IN (e.g. "30m", "6h", "7d"), defaulting to 6h.
 * Only "<integer><s|m|h|d>" is accepted so the JWT expiry and the cookie
 * maxAge can never be interpreted differently.
 */
export function getJwtExpiresIn(configService: ConfigService): string {
  const value = (
    configService.get<string>('JWT_EXPIRES_IN') ?? DEFAULT_JWT_EXPIRES_IN
  ).trim();
  durationToMs(value);
  return value;
}

export function durationToMs(duration: string): number {
  const match = DURATION_PATTERN.exec(duration);
  if (!match) {
    throw new Error(
      `Invalid JWT_EXPIRES_IN "${duration}": expected <integer><s|m|h|d>, e.g. "6h".`,
    );
  }
  const amount = Number(match[1]);
  if (amount <= 0) {
    throw new Error(`Invalid JWT_EXPIRES_IN "${duration}": must be positive.`);
  }
  return amount * UNIT_TO_MS[match[2]];
}
