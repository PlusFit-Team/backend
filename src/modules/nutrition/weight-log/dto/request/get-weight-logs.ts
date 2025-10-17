import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum WeightLogTimeFrame {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ALL = 'ALL',
}

export class GetWeightLogsQueryDto {
  @ApiProperty({
    enum: WeightLogTimeFrame,
    required: false,
    default: WeightLogTimeFrame.ALL,
  })
  @IsEnum(WeightLogTimeFrame)
  frame?: WeightLogTimeFrame;
}
