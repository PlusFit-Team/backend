import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminLoginDto {
  @ApiProperty({
    example: 'codewithdoni@gmail.com',
    maxLength: 56,
    minLength: 5,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(56)
  credentials: string;

  @ApiProperty({ example: '1234' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
