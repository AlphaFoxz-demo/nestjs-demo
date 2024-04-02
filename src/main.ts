import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as fs from 'fs';

async function bootstrap() {
  // const httpsOptions = {
  // key: fs.readFileSync(''),
  // cert: fs.readFileSync(''),
  // };
  const app = await NestFactory.create(AppModule, {
    cors: { allowedHeaders: '*' },
    // httpsOptions,
  });
  await app.listen(process.env.SERVER_PORT || 8080);
}
bootstrap();
