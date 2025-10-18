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

class HealthAnalysisDto {
  @ApiProperty({
    enum: ['NORMAL', 'WARNING', 'CAUTION'],
    description: 'Health status based on user conditions',
  })
  status: 'NORMAL' | 'WARNING' | 'CAUTION';

  @ApiProperty({
    description: 'Short warning or status message (1-2 sentences)',
  })
  alert: string;

  @ApiProperty({
    description: 'Detailed explanation with recommendations',
  })
  details: string;
}

export class GeminiAnalyzeFoodResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [IngredientDto] })
  ingredients: IngredientDto[];

  @ApiProperty({ type: TotalNutritionDto })
  total: TotalNutritionDto;

  @ApiProperty({
    type: HealthAnalysisDto,
    description: 'Health analysis based on user health conditions',
    required: false,
  })
  healthAnalysis?: HealthAnalysisDto;
}
