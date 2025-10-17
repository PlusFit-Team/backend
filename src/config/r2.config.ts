import { registerAs } from '@nestjs/config';

interface R2ConfigOptions {
  bucket: string;
  access: string;
  secret: string;
  endpoint: string;
  publicUrl: string;
}

export const r2Config = registerAs<R2ConfigOptions>(
  'r2',
  (): R2ConfigOptions => ({
    bucket: process.env.R2_BUCKET,
    access: process.env.R2_ACCESS_KEY,
    secret: process.env.R2_SECRET_KEY,
    endpoint: process.env.R2_ENDPOINT,
    publicUrl: process.env.R2_PUBLIC_URL,
  }),
);
