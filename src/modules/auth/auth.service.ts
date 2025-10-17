import { FirebaseService, RedisService, UserService } from '@modules';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma';
import { AuthProvider, RoleTypes } from '@prisma/client';
import { MailService, SmsService } from '@services';
import { ServiceExceptions, comparePassword, hashPassword } from '@utils';
import * as jwt from 'jsonwebtoken';
import { JwtHeader } from 'jsonwebtoken';
import * as jwksClient from 'jwks-rsa';

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
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
    private readonly redisService: RedisService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async adminLogin(payload: AdminLoginDto): Promise<AdminLoginResponseDto> {
    const { credentials, password } = payload;

    const user = await this.userService.findOneAdmin(credentials);
    if (!user) throw new NotFoundException('User not found');

    if (user.role !== RoleTypes.ADMIN)
      throw new ForbiddenException('Access denied');

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    return await this.getTokens(user.id, user.role);
  }

  async phoneRegister(payload: PhoneRegisterDto): Promise<SignUpResponseDto> {
    const { fullname, password, phone } = payload;

    const existingUser = await this.userService.findOneByPhone(phone);
    if (existingUser) {
      throw new ConflictException();
    }

    const userKey = `phone-auth:${phone}`;
    const userData = { fullname, password, phone };

    await this.redisService.save(userKey, JSON.stringify(userData));

    const { keyHash, otp } = await this.redisService.sendOtp();
    await this.sendOtpSms(phone, otp);

    return { data: keyHash };
  }

  async phoneLogin(payload: PhoneLoginDto): Promise<LoginResponseDto> {
    const { password, phone } = payload;

    const user = await this.userService.findOneByPhone(phone);

    if (!user) throw new ForbiddenException();

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) throw new ForbiddenException();

    const { accessToken, refreshToken } = await this.getTokens(user.id);

    return { accessToken, refreshToken };
  }

  async emailRegister(payload: EmailRegisterDto): Promise<SignUpResponseDto> {
    const { email, fullname } = payload;

    const user = await this.userService.findOneByEmail(email);
    if (user) throw new ConflictException();

    const userKey = `email-auth:${email}`;
    const userData = { fullname, email };

    await this.redisService.save(userKey, JSON.stringify(userData));

    const { keyHash, otp } = await this.redisService.sendOtp();
    await this.sendOtpEmail(email, otp);

    return { data: keyHash };
  }

  async emailLogin(payload: EmailLoginDto): Promise<SignUpResponseDto> {
    const { email } = payload;

    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new NotFoundException();

    const { keyHash, otp } = await this.redisService.sendOtp();
    await this.sendOtpEmail(email, otp);

    return { data: keyHash };
  }

  async verifyPhone(payload: VerifyAuthDto): Promise<LoginResponseDto> {
    const userKey = `phone-auth:${payload.credentials}`;
    const userData = await this.redisService.getData(userKey);

    if (!userData) {
      throw new BadRequestException('Foydalanuvchi maʼlumotlari topilmadi');
    }

    const isVerify = await this.redisService.verifyOtp(
      payload.hashCode,
      payload.code,
    );
    if (!isVerify) throw new BadRequestException('Kod xato kiritildi');

    const { fullname, password, phone } = JSON.parse(userData);

    const hashedPassword = await hashPassword(password);
    const newUser = await this.prisma.user.create({
      data: {
        fullname,
        password: hashedPassword,
        phone,
        provider: AuthProvider.PHONE,
      },
    });

    await this.redisService.delete(payload.hashCode);
    await this.redisService.delete(userKey);

    return this.getTokens(newUser.id);
  }

  async verifyEmail(payload: VerifyAuthDto): Promise<LoginResponseDto> {
    const userKey = `email-auth:${payload.credentials}`;
    const userData = await this.redisService.getData(userKey);

    if (!userData) {
      throw new BadRequestException('Foydalanuvchi maʼlumotlari topilmadi');
    }

    const isVerify = await this.redisService.verifyOtp(
      payload.hashCode,
      payload.code,
    );
    if (!isVerify) throw new BadRequestException('Kod xato kiritildi');

    const { fullname, email } = JSON.parse(userData);

    const newUser = await this.prisma.user.create({
      data: {
        fullname,
        email,
        provider: AuthProvider.EMAIL,
      },
    });

    await this.redisService.delete(payload.hashCode);
    await this.redisService.delete(userKey);

    return this.getTokens(newUser.id);
  }

  async verifyLogin(payload: VerifyAuthDto): Promise<LoginResponseDto> {
    const isVerify = await this.redisService.verifyOtp(
      payload.hashCode,
      payload.code,
    );
    if (!isVerify) throw new BadRequestException('Kod notogri');

    const user =
      (await this.userService.findOneByPhone(payload.credentials)) ||
      (await this.userService.findOneByEmail(payload.credentials));

    if (!user) throw new NotFoundException('Foydalanuvchi mavjud emas');

    await this.redisService.delete(payload.hashCode);

    return this.getTokens(user.id);
  }

  async handleGoogle(payload: GoogleAuthDto): Promise<LoginResponseDto> {
    const { fullname, idToken, firebaseUid, provider, photoUrl } = payload;

    const decodedData = await this.firebaseService.verifyIdToken(idToken);

    if (firebaseUid !== decodedData.uid) {
      throw new BadRequestException('Invalid firebase user id');
    }

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { firebaseId: firebaseUid, deletedAt: null },
          { email: decodedData.email, deletedAt: null },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          fullname,
          email: decodedData.email,
          provider,
          firebaseId: firebaseUid,
          photoUrl,
        },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { fullname, photoUrl },
      });
    }

    return this.getTokens(user.id, user.role);
  }

  async handleApple(payload: AppleAuthDto): Promise<LoginResponseDto> {
    const { identityToken, fullname, provider } = payload;

    const verified = await this.verifyAppleIdToken(identityToken);
    const appleId = verified.sub;
    const email = verified.email;

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { appleId, deletedAt: null },
          { email, deletedAt: null },
        ],
      },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { fullname, email, provider, appleId },
      });
    } else {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { fullname },
      });
    }

    return this.getTokens(user.id, user.role);
  }

  async getTokens(
    userId: string,
    role?: RoleTypes,
  ): Promise<LoginResponseDto | AdminLoginResponseDto> {
    const accessTokenSecret = this.config.get<string>('jwt.jwtAccessSecretKey');
    const accessTokenExpires = this.config.get('jwt.jwtAccessExpiresIn');
    const refreshTokenSecret = this.config.get<string>('jwt.jwtRefreshSecretKey');
    const refreshTokenExpires = this.config.get('jwt.jwtRefreshExpiresIn');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id: userId, role },
        {
          secret: accessTokenSecret,
          expiresIn: accessTokenExpires,
        },
      ),
      this.jwtService.signAsync(
        { id: userId, role },
        {
          secret: refreshTokenSecret,
          expiresIn: refreshTokenExpires,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async sendOtpEmail(email: string, otp: string) {
    try {
      await this.mailService.sendMail({
        text: otp,
        subject: 'Tasdiqlash kodi',
        email,
      });
    } catch (error) {
      console.log(error);

      ServiceExceptions.handle(error.message, AuthService.name, 'sendOtpEmail');
      throw new InternalServerErrorException('Try again');
    }
  }

  private async sendOtpSms(phoneNumber: string, otp: string) {
    try {
      await this.smsService.sendSms(otp, phoneNumber);
    } catch (error) {
      ServiceExceptions.handle(error.message, AuthService.name, 'sendOtpSms');
      throw new InternalServerErrorException('Try again');
    }
  }

  private async verifyAppleIdToken(idToken: string) {
    const decoded = jwt.decode(idToken, { complete: true });
    if (!decoded || typeof decoded === 'string') {
      throw new BadRequestException('Invalid Apple ID token');
    }

    const kid = (decoded.header as JwtHeader).kid;
    const alg = (decoded.header as JwtHeader).alg;

    const client = jwksClient({
      jwksUri: 'https://appleid.apple.com/auth/keys',
    });

    const key = await client.getSigningKey(kid);
    const publicKey = key.getPublicKey();

    const payload = jwt.verify(idToken, publicKey, {
      algorithms: [alg as jwt.Algorithm],
    }) as {
      sub: string;
      email?: string;
    };

    return payload;
  }
}
