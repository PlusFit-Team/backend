import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateNutritionTargetDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  calories: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  carbs: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  protein: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  fat: number;
}
