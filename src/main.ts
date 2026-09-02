import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { config } from './common/config/swagger';
import { ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  
  app.setGlobalPrefix('api/v1');

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true
  }))

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(4000,"0.0.0.0");
}
bootstrap();