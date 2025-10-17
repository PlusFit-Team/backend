import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { WeightLogController } from './weight-log.controller';
import { WeightLogService } from './weight-log.service';

@Module({
  imports: [PrismaModule],
  controllers: [WeightLogController],
  providers: [WeightLogService],
  exports: [],
})
export class WeightLogModule {}
