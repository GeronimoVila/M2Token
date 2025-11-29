import 'tsconfig-paths/register'; 
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 4000);
  console.log(
    `🚀 Servidor backend corriendo en http://localhost:${
      process.env.PORT || 4000
    }`
  );
}
bootstrap();