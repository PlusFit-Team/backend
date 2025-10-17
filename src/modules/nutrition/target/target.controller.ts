import { ApiSuccessResponse, CurrentUser } from '@decorators';
import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { ICurrentUser } from '@type';

import {
  CreateNutritionTargetDto,
  FindMineNutritionTargetResponseDto,
  UpdateNutritionTargetDto,
} from '../target/dto';
import { TargetService } from './target.service';

@ApiBearerAuth()
@ApiTags('NutritionTarget')
@Controller('nutrition-target')
export class TargetController {
  constructor(private readonly service: TargetService) {}

  @Post()
  @ApiNoContentResponse({ description: 'No content' })
  create(
    @Body() payload: CreateNutritionTargetDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.service.create(payload, user);
  }

  @Get('me')
  @ApiSuccessResponse(FindMineNutritionTargetResponseDto)
  findOne(@CurrentUser() user: ICurrentUser) {
    return this.service.findOne(user);
  }

  @Patch('me')
  @ApiNoContentResponse({ description: 'No content' })
  update(
    @Body() payload: UpdateNutritionTargetDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.service.update(payload, user);
  }
}
