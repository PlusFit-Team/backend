import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ICurrentUser } from '@type';

import {
  CreateNutritionTargetDto,
  FindMineNutritionTargetResponseDto,
  UpdateNutritionTargetDto,
} from './dto';

@Injectable()
export class TargetService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreateNutritionTargetDto,
    user: ICurrentUser,
  ): Promise<void> {
    const exits = await this.prisma.nutritionTarget.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!exits) {
      await this.prisma.nutritionTarget.create({
        data: {
          ...payload,
          userId: user.id,
        },
      });
    }
  }

  async findOne(
    user: ICurrentUser,
  ): Promise<FindMineNutritionTargetResponseDto> {
    return await this.prisma.nutritionTarget.findUnique({
      where: {
        userId: user.id,
      },
      select: {
        protein: true,
        calories: true,
        carbs: true,
        fat: true,
      },
    });
  }

  async update(
    payload: UpdateNutritionTargetDto,
    user: ICurrentUser,
  ): Promise<void> {
    const updateData: any = {};
    if (payload.calories !== undefined) updateData.calories = payload.calories;
    if (payload.carbs !== undefined) updateData.carbs = payload.carbs;
    if (payload.protein !== undefined) updateData.protein = payload.protein;
    if (payload.fat !== undefined) updateData.fat = payload.fat;

    await this.prisma.nutritionTarget.upsert({
      where: { userId: user.id },
      create: { ...payload, userId: user.id },
      update: updateData,
    });
  }
}
