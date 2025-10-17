import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { TargetController } from './target.controller';
import { TargetService } from './target.service';

@Module({
  imports: [PrismaModule],
  controllers: [TargetController],
  providers: [TargetService],
})
export class TargetModule {}
