import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AuthProvider } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AppleAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  identityToken: string;

  @ApiProperty()
  @IsOptional()
  authorizationCode?: string;

  @ApiProperty()
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(2)
  @MaxLength(128)
  @IsString()
  fullname?: string;
}
