import { ApiSuccessResponse, CurrentUser } from '@decorators';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ICurrentUser } from '@type';

import {
  CreateWeightLogDto,
  GetLogsResponseDto,
  GetWeightLogsQueryDto,
} from './dto';
import { WeightLogService } from './weight-log.service';

@ApiBearerAuth()
@ApiTags('WeightLog')
@Controller('weight-log')
export class WeightLogController {
  constructor(private readonly service: WeightLogService) {}

  @Post()
  create(@Body() dto: CreateWeightLogDto, @CurrentUser() user: ICurrentUser) {
    return this.service.create(dto, user);
  }

  @Get('')
  @ApiSuccessResponse(GetLogsResponseDto, true)
  getMyLogs(
    @Query() query: GetWeightLogsQueryDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<GetLogsResponseDto[]> {
    return this.service.getLogs(user, query);
  }
}
