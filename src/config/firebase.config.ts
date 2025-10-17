import { registerAs } from '@nestjs/config';

export interface FirebaseConfigOptions {
  projectId: string;
  privateKey: string;
  clientEmail: string;
}

export const firebaseConfig = registerAs<FirebaseConfigOptions>(
  'firebase',
  (): FirebaseConfigOptions => ({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
);
