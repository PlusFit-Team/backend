import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [PrismaModule],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [],
})
export class NutritionWithGemeniModule {}
