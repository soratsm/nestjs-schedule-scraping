import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import 'source-map-support/register';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  app.use(helmet());

  app.enableCors({
    origin: process.env.ORIGIN,
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept',
    credentials: true,
    optionsSuccessStatus: 200,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
