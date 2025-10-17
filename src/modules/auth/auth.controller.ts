import { ApiSuccessResponse, Public } from '@decorators';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import {
  AdminLoginDto,
  AdminLoginResponseDto,
  AppleAuthDto,
  EmailLoginDto,
  EmailRegisterDto,
  GoogleAuthDto,
  LoginResponseDto,
  PhoneLoginDto,
  PhoneRegisterDto,
  SignUpResponseDto,
  VerifyAuthDto,
  VerifyType,
} from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(AdminLoginResponseDto)
  @Post('admin/login')
  adminLogin(@Body() payload: AdminLoginDto): Promise<AdminLoginResponseDto> {
    return this.service.adminLogin(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(LoginResponseDto)
  @Post('google')
  googleAuth(@Body() payload: GoogleAuthDto): Promise<LoginResponseDto> {
    return this.service.handleGoogle(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(SignUpResponseDto)
  @Post('email/signup')
  emailRegister(@Body() payload: EmailRegisterDto): Promise<SignUpResponseDto> {
    return this.service.emailRegister(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(SignUpResponseDto)
  @Post('email/signin')
  emailLogin(@Body() payload: EmailLoginDto): Promise<SignUpResponseDto> {
    return this.service.emailLogin(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(LoginResponseDto)
  @Post('apple')
  appleAuth(@Body() payload: AppleAuthDto): Promise<LoginResponseDto> {
    return this.service.handleApple(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(LoginResponseDto)
  @Post('phone/signin')
  async phoneRegister(
    @Body() payload: PhoneLoginDto,
  ): Promise<LoginResponseDto> {
    return await this.service.phoneLogin(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(SignUpResponseDto)
  @Post('phone/signup')
  async phoneLogin(
    @Body() payload: PhoneRegisterDto,
  ): Promise<SignUpResponseDto> {
    return await this.service.phoneRegister(payload);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiSuccessResponse(LoginResponseDto)
  @Post('verify')
  async verify(@Body() payload: VerifyAuthDto): Promise<LoginResponseDto> {
    switch (payload.type) {
      case VerifyType.PHONE:
        return this.service.verifyPhone(payload);
      case VerifyType.EMAIL:
        return this.service.verifyEmail(payload);
      case VerifyType.LOGIN:
        return this.service.verifyLogin(payload);
    }
  }
}
