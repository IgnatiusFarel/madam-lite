import { Module } from '@nestjs/common';
import { CompanyInformationService } from './company-information.service';
import { CompanyInformationController } from './company-information.controller';
import { CompanyInformation } from './entities/company-information.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyInformation])],
  controllers: [CompanyInformationController],
  providers: [CompanyInformationService],
  exports: [CompanyInformationService],
})
export class CompanyInformationModule { }
