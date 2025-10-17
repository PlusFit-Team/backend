import { Limit, Page } from '@decorators';
import { Pagination } from '@enums';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class BaseFindDto {
  @ApiPropertyOptional()
  @Page()
  pageNumber?: number = Pagination.PAGE_NUMBER;

  @ApiPropertyOptional()
  @Limit()
  pageSize?: number = Pagination.PAGE_SIZE;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
