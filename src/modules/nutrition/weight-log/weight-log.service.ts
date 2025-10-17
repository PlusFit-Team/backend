import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ICurrentUser } from '@type';

import {
  CreateWeightLogDto,
  GetLogsResponseDto,
  GetWeightLogsQueryDto,
  WeightLogTimeFrame,
} from './dto';

@Injectable()
export class WeightLogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateWeightLogDto, user: ICurrentUser): Promise<void> {
    await this.prisma.weightLog.create({
      data: {
        weight: payload.weight,
        userId: user.id,
      },
    });
  }

  async getLogs(
    user: ICurrentUser,
    payload: GetWeightLogsQueryDto,
  ): Promise<GetLogsResponseDto[]> {
    const { frame } = payload;
    const today = new Date();

    if (frame === WeightLogTimeFrame.ALL) {
      return await this.prisma.weightLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        select: { weight: true, createdAt: true },
      });
    }

    if (frame === WeightLogTimeFrame.WEEKLY) {
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);

      return await this.prisma.weightLog.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: weekAgo },
        },
        orderBy: { createdAt: 'desc' },
        select: { weight: true, createdAt: true },
      });
    }

    if (frame === WeightLogTimeFrame.MONTHLY) {
      const monthAgo = new Date();
      monthAgo.setMonth(today.getMonth() - 1);

      return await this.prisma.weightLog.findMany({
        where: {
          userId: user.id,
          createdAt: { gte: monthAgo },
        },
        orderBy: { createdAt: 'desc' },
        select: { weight: true, createdAt: true },
      });
    }
  }
}
