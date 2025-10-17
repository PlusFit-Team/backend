import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@prisma';
import { Prisma } from '@prisma/client';
import { ICurrentUser } from '@type';
import { formatResponse } from '@utils';

import { FindAllUsersDto, ProfileResponseDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null,
      },
    });
  }

  async findOneByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  async findOneAdmin(credentials: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ phone: credentials }, { email: credentials }],
        deletedAt: null,
      },
    });
  }

  async findOneByUniqueId(credentials: string) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ firebaseId: credentials }, { appleId: credentials }],
        deletedAt: null,
      },
    });
  }

  async findAll(query: FindAllUsersDto) {
    const { pageNumber, pageSize, search } = query;
    const skip = (pageNumber - 1) * pageSize;

    const [data, count] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
          OR: [
            { fullname: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: this.userIncludeFields(),
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    const formatted = data.map((u) => {
      return {
        ...u,
        goalBlocker: u.goalBlocker?.map((g: any) => g.blocker) ?? [],
        fitnesGoal: u.fitnesGoal?.map((f: any) => f.goal) ?? [],
      };
    });

    return formatResponse(formatted, {
      count,
      pageNumber,
      pageSize,
    });
  }

  async update(payload: UpdateUserDto, user: ICurrentUser): Promise<void> {
    const { goalBlocker, fitnesGoal, ...otherPayload } = payload;
    const updateData: Prisma.UserUpdateInput = {
      ...otherPayload,
    };

    if (goalBlocker) {
      updateData.goalBlocker = {
        deleteMany: { userId: user.id },
        create: goalBlocker.map((blocker) => ({ blocker })),
      };
    }

    if (fitnesGoal) {
      updateData.fitnesGoal = {
        deleteMany: { userId: user.id },
        create: fitnesGoal.map((goal) => ({ goal })),
      };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const updatedUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: this.userIncludeFields(),
    });

    if (!updatedUser) return;

    const requiredFields = [
      'language',
      'provider',
      'gender',
      'source',
      'height',
      'weight',
      'birthday',
      'goal',
      'fitnesGoal',
      'targetWeight',
      'goalBlocker',
      'mealFrequency',
      'trainingFrequency',
    ] as const;

    const isOnboarded = requiredFields.every((field) => {
      const value = (updatedUser as any)[field];
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && value !== undefined;
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { isOnboarded },
    });
  }

  async profile(user: ICurrentUser): Promise<ProfileResponseDto> {
    const [userData] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: user.id, deletedAt: null },
        include: this.userIncludeFields(),
      }),
    ]);

    if (!userData) {
      throw new ForbiddenException();
    }

    return {
      ...userData,
      goalBlocker: userData.goalBlocker?.map((g: any) => g.blocker) ?? [],
      fitnesGoal: userData.fitnesGoal?.map((f: any) => f.goal) ?? [],
    };
  }

  private userIncludeFields() {
    const userInclude: Prisma.UserInclude = {
      goalBlocker: true,
      fitnesGoal: true,
    };
    return userInclude;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  async findOne(
    id: string,
    error: boolean = true,
  ): Promise<ProfileResponseDto> {
    const data = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: this.userIncludeFields(),
    });

    if (!data && error) {
      throw new NotFoundException(`User Not Found: ${id}`);
    }

    return {
      ...data,
      goalBlocker: data.goalBlocker?.map((g: any) => g.blocker) ?? [],
      fitnesGoal: data.fitnesGoal?.map((f: any) => f.goal) ?? [],
    };
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), firebaseId: null, appleId: null },
    });
  }
}
