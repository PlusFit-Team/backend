import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';


import { AppModule } from './app';
import { TransformInterceptor } from '@interceptors';
import { AppConfigOptions } from '@config';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfigOptions>('app');

  app.use(compression());
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableVersioning({ defaultVersion: '1', type: VersioningType.URI });
  app.useGlobalInterceptors(new TransformInterceptor());


  const options = new DocumentBuilder()
    .setTitle('Fity')
    .setDescription('API for Fity system')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(appConfig.port, () => {
    console.log(
      `Server is running on http://${appConfig.host}:${appConfig.port}`,
    );

    console.log(
      `Swagger route: http://${appConfig.host}:${appConfig.port}/api/docs`,
    );
  });
}
bootstrap()
  .then(() => {
    logger.log(`Server is running on port: [${process.env['APP_PORT']}]`);
  })
  .catch((err) => {
    logger.log(`Error is occurred during initialization the server: [${err}]`);
  });
