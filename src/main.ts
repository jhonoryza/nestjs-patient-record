import {
  Logger,
  LogLevel,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from '@utils/exception';
import { GlobalCustomResponseInterceptor } from '@utils/interceptors/global-response.interceptor';
import { version } from '../package.json';
import { AppModule } from './app.module';

function getLogLevels(envValue?: string): LogLevel[] {
  return (envValue ?? 'error,warn,log')
    .split(',')
    .map((l) => l.trim()) as LogLevel[];
}

export const projectVersion = version;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Set log level
  const logger = new Logger();
  const logLevels = getLogLevels(configService.get<string>('LOG_LEVEL'));
  app.useLogger(logLevels);

  // Set api prefix
  app.setGlobalPrefix('api');

  // Set api version
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Set global response interceptor
  app.useGlobalInterceptors(new GlobalCustomResponseInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Set global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Set cors
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
    credentials: false,
  });

  const appPort = configService.get<number>('app.port');
  await app.listen(appPort || 3000, '0.0.0.0');
  logger.log(
    `Your Application run in ${await app.getUrl()}`,
    'Nest Application',
  );
}
bootstrap();
