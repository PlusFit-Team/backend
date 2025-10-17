import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class PhoneRegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;

  @ApiProperty()
  @MinLength(2)
  @MaxLength(128)
  @IsString()
  fullname: string;
}

export class PhoneLoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(4)
  password: string;
}
