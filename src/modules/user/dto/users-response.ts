import { ApiProperty } from '@nestjs/swagger';
import {
  AuthProvider,
  FitnesGoal,
  Goal,
  GoalBlocker,
  MealFrequency,
  TrainingFrequency,
} from '@prisma/client';

export class ProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fullname: string;

  @ApiProperty()
  phone?: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  language?: string;

  @ApiProperty()
  isOnboarded?: boolean;

  @ApiProperty()
  photoUrl?: string;

  @ApiProperty({ enum: AuthProvider })
  provider?: AuthProvider;

  @ApiProperty()
  gender?: string;

  @ApiProperty()
  source?: string;

  @ApiProperty()
  height?: number;

  @ApiProperty()
  weight?: number;

  @ApiProperty()
  birthday?: Date;

  @ApiProperty({ enum: Goal })
  goal?: Goal;

  @ApiProperty({ enum: FitnesGoal, isArray: true })
  fitnesGoal?: FitnesGoal[];

  @ApiProperty()
  targetWeight?: number;

  @ApiProperty({ enum: GoalBlocker, isArray: true })
  goalBlocker?: GoalBlocker[];

  @ApiProperty({ enum: MealFrequency })
  mealFrequency?: MealFrequency;

  @ApiProperty({ enum: TrainingFrequency })
  trainingFrequency?: TrainingFrequency;

  @ApiProperty()
  hasPremium?: boolean;

  @ApiProperty()
  createdAt?: Date;
}

export class FindAllUsersResponseDto {
  @ApiProperty({ type: [ProfileResponseDto] })
  data: ProfileResponseDto[];
}
