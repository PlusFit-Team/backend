import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '@prisma';

import { AiChatGateway } from './ai-health-chat.gateway';
import { AiChatService } from './ai-health-chat.service';

@Module({
  imports: [PrismaModule, JwtModule],
  controllers: [],
  providers: [AiChatService, AiChatGateway],
  exports: [AiChatService],
})
export class AiHealthChatModule {}
