import { BaseFindDto } from '@dtos';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindAllUsersDto extends OmitType(BaseFindDto, ['isActive']) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;
}
