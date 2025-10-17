import { registerAs } from '@nestjs/config';

export interface GeminiConfigOptions {
  key: string;
}

export const gemeniConfig = registerAs<GeminiConfigOptions>(
  'gemeni',
  (): GeminiConfigOptions => ({
    key: process.env.GEMINI_API_KEY,
  }),
);
