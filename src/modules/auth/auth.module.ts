import { FirebaseModule, SharedModule, UserModule } from '@modules';
import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';
import { MailService, SmsService } from '@services';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule, UserModule, SharedModule, FirebaseModule],
  controllers: [AuthController],
  providers: [AuthService, SmsService, MailService],
})
export class AuthModule {}
