import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import { JwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe() // validationPipe for validating DTOs
  )
  // app.use(JwtMiddleware) // Middlewares in main.ts is only allowed for functional middlewares, not class middlewares
  await app.listen(3000);
}
bootstrap();
