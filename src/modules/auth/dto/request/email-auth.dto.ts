import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class EmailRegisterDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(2)
  @MaxLength(128)
  @IsString()
  fullname?: string;
}

export class EmailLoginDto {
  @ApiProperty({})
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
