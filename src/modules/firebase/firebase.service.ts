import { FirebaseConfigOptions } from '@config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private firebaseAdmin: admin.app.App;

  constructor(private configService: ConfigService) {
    const firebaseConfig =
      this.configService.get<FirebaseConfigOptions>('firebase');

    this.firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({ ...firebaseConfig }),
    });
  }

  async subscribeToTopic(token: string, topic: string) {
    const response = await this.firebaseAdmin
      .messaging()
      .subscribeToTopic(token, topic);

    return response;
  }

  async unsubscribeFromTopic(token: string, topic: string) {
    const response = await this.firebaseAdmin
      .messaging()
      .unsubscribeFromTopic(token, topic);

    return response;
  }

  async sendNotificationToTokens(
    message: Omit<admin.messaging.MulticastMessage, 'tokens'> & {
      tokens: string[];
    },
  ) {
    const response = await this.firebaseAdmin
      .messaging()
      .sendEachForMulticast(message);
    return response;
  }

  async sendNotificationToTopic(message: admin.messaging.Message) {
    const response = await this.firebaseAdmin.messaging().send(message);

    return response;
  }

  async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.firebaseAdmin
        .auth()
        .verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new BadRequestException('Invalid Firebase ID Token');
    }
  }
}
