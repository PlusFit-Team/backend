import { ApiProperty } from '@nestjs/swagger';

export class GetLogsResponseDto {
  @ApiProperty()
  weight: number;

  @ApiProperty()
  createdAt: Date;
}
