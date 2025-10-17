import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma';

import { NutritionWithGemeniModule } from './nutrition';
import { TargetModule } from './target';
import { WeightLogModule } from './weight-log';

@Module({
  imports: [
    NutritionWithGemeniModule,
    TargetModule,
    WeightLogModule,
    WeightLogModule,
  ],
})
export class NutritionModule {}
