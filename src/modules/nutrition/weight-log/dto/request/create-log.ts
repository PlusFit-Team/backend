import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class CreateWeightLogDto {
  @ApiProperty()
  @IsNumber()
  weight: number;
}
