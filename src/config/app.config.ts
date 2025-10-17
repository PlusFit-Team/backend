import { registerAs } from '@nestjs/config';

export interface AppConfigOptions {
  port: number;
  host: string;
}

export const appConfig = registerAs<AppConfigOptions>(
  'app',
  (): AppConfigOptions => ({
    port: +process.env.APP_PORT,
    host: process.env.APP_HOST,
  }),
);
