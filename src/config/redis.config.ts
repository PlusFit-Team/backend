import { registerAs } from '@nestjs/config';

export interface RedisConfigOptions {
  host: string;
  port: number;
}

export const redisConfig = registerAs<RedisConfigOptions>(
  'redis',
  (): RedisConfigOptions => ({
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
  }),
);
