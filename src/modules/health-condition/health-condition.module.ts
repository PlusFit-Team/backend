import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { HealthConditionController } from './health-condition.controller';
import { HealthConditionService } from './health-condition.service';

@Module({
  imports: [PrismaModule],
  controllers: [HealthConditionController],
  providers: [HealthConditionService],
})
export class HealthConditionModule {}
