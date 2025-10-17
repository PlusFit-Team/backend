import { ApiSuccessResponse, CurrentUser } from '@decorators';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ICurrentUser } from '@type';

import {
  AnalyzeFoodRequestDto,
  GeminiAnalyzeFoodResponseDto,
  GetDailyNutritionResponseDto,
} from './dto';
import { NutritionService } from './nutrition.service';

@ApiTags('Nutrition')
@ApiBearerAuth()
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly service: NutritionService) {}

  @Post('analyze/image')
  @ApiSuccessResponse(GeminiAnalyzeFoodResponseDto)
  async analyzeFood(
    @Body() payload: AnalyzeFoodRequestDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<GeminiAnalyzeFoodResponseDto> {
    return await this.service.processImageNutrition(payload.link, user);
  }

  @Get()
  @ApiSuccessResponse(GetDailyNutritionResponseDto)
  async getNutrition(
    @CurrentUser() user: ICurrentUser,
  ): Promise<GetDailyNutritionResponseDto> {
    return await this.service.getNutrition(user);
  }
}
