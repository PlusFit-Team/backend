import { ApiProperty } from '@nestjs/swagger';

class NutritionDto {
  @ApiProperty()
  calories: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  fiber: number;

  @ApiProperty()
  sugar: number;

  @ApiProperty()
  sodium: number;
}

class IngredientDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  portion: string;

  @ApiProperty()
  portionGrams: number;

  @ApiProperty({ type: NutritionDto })
  nutrition: NutritionDto;
}

class TotalNutritionDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  calories: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  fiber: number;

  @ApiProperty()
  sugar: number;

  @ApiProperty()
  sodium: number;

  @ApiProperty()
  imageUrl?: string;
}

export class GeminiAnalyzeFoodResponseDto {
  @ApiProperty({ type: [IngredientDto] })
  ingredients: IngredientDto[];

  @ApiProperty({ type: TotalNutritionDto })
  total: TotalNutritionDto;
}
