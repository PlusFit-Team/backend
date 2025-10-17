import { registerAs } from '@nestjs/config';

interface JwtConfigOptions {
  jwtAccessSecretKey: string;
  jwtRefreshSecretKey: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
}

export const jwtConfig = registerAs<JwtConfigOptions>(
  'jwt',
  (): JwtConfigOptions => ({
    jwtAccessSecretKey: process.env.JWT_ACCESS_SECRET_KEY,
    jwtRefreshSecretKey: process.env.JWT_REFRESH_SECRET_KEY,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES,
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES,
  }),
);
