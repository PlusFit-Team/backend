import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum VerifyType {
  PHONE = 'phone',
  EMAIL = 'email',
  LOGIN = 'login',
}

export class VerifyAuthDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  hashCode: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  credentials: string;

  @ApiProperty({ enum: VerifyType })
  @IsEnum(VerifyType)
  type: VerifyType;
}
