import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  // Aktifkan validasi secara global
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');
  const port: number = Number(process.env.PORT);
  
  // Middleware to enforce path regex
  // app.use((req, res, next) => {
  //   if (req.hostname === 'https://madam-lite.kodegiri.com' && req.path.startsWith('/api')) {
  //     next(); // Allow the request to proceed
  //   } else {
  //     res.status(404).send('Not Found'); // Respond with 404 for requests not matching the domain and path prefix
  //   }
  // });
  
  app.enableCors({
    // allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'Authorization'],
    // origin: ['https://madam-lite.kodegiri.com', 'https://madam-lite.kodegiri.com/api','http://localhost:3333'],
    // credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'DELETE','HEAD','PATCH'],
    allowedHeaders: '*',
    origin: '*', 
    methods: '*',
    credentials: true, 
  });

  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   methods: '*',
  //   // credentials: true, 
  // });

  await app.listen(port, '0.0.0.0');

}
bootstrap();
