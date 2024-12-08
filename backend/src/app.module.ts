import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DemographModule } from './master-data/demograph/demograph.module';
import { PsychographModule } from './master-data/psychograph/psychograph.module';
import { AioAnalysisResponseModule } from './data-analysis/aio-analysis/aio-analysis-response/aio-analysis-response.module';
import { CompanyInformationModule } from './data-analysis/aio-analysis/company-information/company-information.module';
import { ActivityHistoryModule } from './activity-history/activity-history.module';
import { ContactPersonModule } from './data-analysis/aio-analysis/contact-person/contact-person.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true
      }),
    }),
    UsersModule,
    AuthModule,
    DemographModule,
    PsychographModule,
    AioAnalysisResponseModule,
    CompanyInformationModule,
    ActivityHistoryModule,
    ContactPersonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
