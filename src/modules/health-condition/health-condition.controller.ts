import { ApiSuccessResponse, CurrentUser } from '@decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ICurrentUser } from '@type';

import {
  CreateHealthConditionDto,
  HealthConditionResponseDto,
  UpdateHealthConditionDto,
} from './dto';
import { HealthConditionService } from './health-condition.service';

@ApiBearerAuth()
@ApiTags('Health Conditions')
@Controller('health-conditions')
export class HealthConditionController {
  constructor(private readonly service: HealthConditionService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Health condition created' })
  create(
    @Body() dto: CreateHealthConditionDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<void> {
    return this.service.create(dto, user);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(HealthConditionResponseDto, true)
  getAllMy(@CurrentUser() user: ICurrentUser): Promise<HealthConditionResponseDto[]> {
    return this.service.getAllMy(user);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(HealthConditionResponseDto)
  getOne(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<HealthConditionResponseDto> {
    return this.service.getOne(id, user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Health condition updated' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHealthConditionDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<void> {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Health condition deleted' })
  delete(
    @Param('id') id: string,
    @CurrentUser() user: ICurrentUser,
  ): Promise<void> {
    return this.service.delete(id, user);
  }
}
