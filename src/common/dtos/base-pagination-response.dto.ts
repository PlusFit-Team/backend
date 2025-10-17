import { ApiProperty } from '@nestjs/swagger';

export class BasePaginationResponseDto {
  @ApiProperty({ example: 500 })
  count: number;

  @ApiProperty({ example: 50 })
  pageCount: number;

  @ApiProperty({ example: 1 })
  pageNumber: number;

  @ApiProperty({ example: 10 })
  pageSize: number;
}
