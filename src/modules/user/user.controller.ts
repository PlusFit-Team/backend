import { ApiSuccessResponse, CurrentUser } from '@decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import { RoleTypes } from '@prisma/client';
import { ICurrentUser } from '@type';
import { Roles } from 'common/decorators/role.decorator';

import { FindAllUsersDto, UpdateUserDto } from './dto';
import { FindAllUsersResponseDto, ProfileResponseDto } from './dto';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Roles(RoleTypes.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(FindAllUsersResponseDto)
  @Get()
  findAll(@Query() query: FindAllUsersDto): Promise<FindAllUsersResponseDto> {
    return this.service.findAll(query);
  }

  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(ProfileResponseDto)
  @Get('me')
  profile(@CurrentUser() user: ICurrentUser): Promise<ProfileResponseDto> {
    return this.service.profile(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'No content' })
  @Patch('me')
  async update(
    @Body() payload: UpdateUserDto,
    @CurrentUser() user: ICurrentUser,
  ): Promise<void> {
    await this.service.update(payload, user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'No content' })
  @Delete('delete')
  delete(@CurrentUser() user: ICurrentUser): Promise<void> {
    return this.service.remove(user.id);
  }
}
