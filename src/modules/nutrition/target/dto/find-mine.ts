import { ApiProperty } from '@nestjs/swagger';

export class FindMineNutritionTargetResponseDto {
  @ApiProperty()
  protein: number;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  fat: number;
}
