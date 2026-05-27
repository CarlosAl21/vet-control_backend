import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

export const redisProvider = {
  provide: REDIS_CLIENT,
  useFactory: () =>
    new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: +(process.env.REDIS_PORT || 6379),
    }),
};
