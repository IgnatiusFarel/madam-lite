import { DataSource } from 'typeorm';
import { userSeeder } from './seeds/user.seeder';
import { AppModule } from 'src/app.module';
import { NestFactory } from '@nestjs/core';

async function runSeeder() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  await userSeeder(dataSource);
  await app.close();
}
runSeeder().catch(console.error);