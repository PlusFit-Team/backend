import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ description: 'Foydalanuvchi uchun access token' })
  accessToken: string;

  @ApiProperty({ description: 'Foydalanuvchi uchun refresh token' })
  refreshToken: string;
}

export class AdminLoginResponseDto {
  @ApiProperty({ description: 'Foydalanuvchi uchun access token' })
  accessToken: string;

  @ApiProperty({ description: 'Foydalanuvchi uchun refresh token' })
  refreshToken: string;
}

export class SignUpResponseDto {
  @ApiProperty()
  data: string;
}
