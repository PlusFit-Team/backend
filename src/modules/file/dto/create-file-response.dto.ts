import { ApiProperty } from '@nestjs/swagger';

export class CreateFileResponseDto {
  @ApiProperty({ example: 'file.png' })
  data: string;
}
