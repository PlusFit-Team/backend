import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { ICurrentUser } from '@type';

import {
  CreateHealthConditionDto,
  HealthConditionResponseDto,
  UpdateHealthConditionDto,
} from './dto';

@Injectable()
export class HealthConditionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    payload: CreateHealthConditionDto,
    user: ICurrentUser,
  ): Promise<void> {
    await this.prisma.userHealthCondition.create({
      data: {
        name: payload.name,
        description: payload.description,
        userId: user.id,
      },
    });
  }

  async getAllMy(
    user: ICurrentUser,
  ): Promise<HealthConditionResponseDto[]> {
    return await this.prisma.userHealthCondition.findMany({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getOne(
    id: string,
    user: ICurrentUser,
  ): Promise<HealthConditionResponseDto> {
    const condition = await this.prisma.userHealthCondition.findFirst({
      where: {
        id,
        userId: user.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!condition) {
      throw new NotFoundException('Health condition not found');
    }

    return condition;
  }

  async update(
    id: string,
    payload: UpdateHealthConditionDto,
    user: ICurrentUser,
  ): Promise<void> {
    await this.getOne(id, user);

    await this.prisma.userHealthCondition.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
      },
    });
  }

  async delete(id: string, user: ICurrentUser): Promise<void> {
    await this.getOne(id, user);

    await this.prisma.userHealthCondition.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
