import {
  RedisConfigOptions,
  appConfig,
  databaseConfig,
  firebaseConfig,
  gemeniConfig,
  jwtConfig,
  r2Config,
  redisConfig,
} from '@config';
import { AuthGuard, RolesGuard } from '@guards';
import KeyvRedis from '@keyv/redis';
import { AuthModule, FileModule, FirebaseModule, HealthConditionModule, NutritionModule, SharedModule, UserModule } from '@modules';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { Keyv } from 'keyv';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [
        appConfig,
        databaseConfig,
        firebaseConfig,
        jwtConfig,
        r2Config,
        redisConfig,
        gemeniConfig,
      ],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const config = configService.get<RedisConfigOptions>('redis');

        const keyv = new Keyv({
          store: new KeyvRedis(`redis://${config.host}:${config.port}`),
        });

        return {
          store: keyv as any,
          ttl: 60 * 60 * 24 * 1000,
        };
      },
    }),
    JwtModule.register({ global: true }),
    FileModule,
    FirebaseModule,
    UserModule,
    SharedModule,
    AuthModule,
    NutritionModule,
    HealthConditionModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
