import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  AuthProvider,
  FitnesGoal,
  Goal,
  GoalBlocker,
  MealFrequency,
  TrainingFrequency,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  fullname?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: AuthProvider })
  @IsEnum(AuthProvider)
  @IsOptional()
  provider?: AuthProvider;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  source?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  height?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  targetWeight?: number;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return value;
    const utcDate = new Date(value);
    const tashkentOffsetMs = 5 * 60 * 60 * 1000;
    const localDate = new Date(utcDate.getTime() + tashkentOffsetMs);
    return localDate.toISOString();
  })
  birthday?: Date;

  @ApiPropertyOptional({ enum: Goal })
  @IsEnum(Goal)
  @IsOptional()
  goal?: Goal;

  @ApiPropertyOptional({ enum: FitnesGoal, isArray: true })
  @IsEnum(FitnesGoal, { each: true })
  @IsArray()
  @IsOptional()
  fitnesGoal?: FitnesGoal[];

  @ApiPropertyOptional({ enum: GoalBlocker, isArray: true })
  @IsEnum(GoalBlocker, { each: true })
  @IsArray()
  @IsOptional()
  goalBlocker?: GoalBlocker[];

  @ApiPropertyOptional({ enum: MealFrequency })
  @IsEnum(MealFrequency)
  @IsOptional()
  mealFrequency?: MealFrequency;

  @ApiPropertyOptional({ enum: TrainingFrequency })
  @IsEnum(TrainingFrequency)
  @IsOptional()
  trainingFrequency?: TrainingFrequency;
}
