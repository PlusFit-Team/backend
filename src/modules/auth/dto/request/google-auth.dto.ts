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

export class GoogleAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  idToken: string;

  @ApiProperty()
  @IsEnum(AuthProvider)
  provider: AuthProvider;

  @ApiProperty()
  @IsNotEmpty()
  firebaseUid: string;

  @ApiProperty()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(128)
  @IsString()
  fullname: string;

  @ApiPropertyOptional()
  @IsOptional()
  photoUrl?: string;
}
