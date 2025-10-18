import { ApiProperty } from '@nestjs/swagger';

class IngredientDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  portion: string;

  @ApiProperty()
  portionGrams: number;

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

class RecentlyUploaded {
  @ApiProperty()
  calories: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  fiber: number;

  @ApiProperty()
  sugar: number;

  @ApiProperty()
  sodium: number;

  @ApiProperty({ example: 'hozircha rasm linki' })
  image: string;

  @ApiProperty()
  mealName: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: [IngredientDto] })
  ingredients: IngredientDto[];

  @ApiProperty({ required: false, nullable: true })
  healthStatus?: string;

  @ApiProperty({ required: false, nullable: true })
  healthAlert?: string;

  @ApiProperty({ required: false, nullable: true })
  healthDetails?: string;
}

class Nutrition {
  @ApiProperty()
  calories: number;

  @ApiProperty()
  carbs: number;

  @ApiProperty()
  fat: number;

  @ApiProperty()
  protein: number;

  @ApiProperty()
  fiber: number;

  @ApiProperty()
  sugar: number;

  @ApiProperty()
  sodium: number;

  @ApiProperty({ type: RecentlyUploaded, isArray: true })
  recentlyUploaded: RecentlyUploaded[];
}

export class GetDailyNutritionResponseDto {
  @ApiProperty()
  today: Nutrition;

  @ApiProperty()
  yesterday: Nutrition;
}
