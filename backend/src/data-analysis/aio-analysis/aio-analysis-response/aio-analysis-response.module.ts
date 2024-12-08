import { Module } from '@nestjs/common';
import { AioAnalysisResponseService } from './aio-analysis-response.service';
import { AioAnalysisResponseController } from './aio-analysis-response.controller';
import { AioAnalysisResponse } from './entities/aio-analysis-response.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyInformation } from '../company-information/entities/company-information.entity';
import { DemographResponse } from './entities/demograph-response.entity';
import { PsychographResponse } from './entities/psychograph-response.entity';
import { PsychographResponseData } from './entities/psychograph-response-data.entity';
import { User } from 'src/users/entities/user.entity';
import { ActivityHistory } from 'src/activity-history/entities/activity-history.entity';
import { Demograph } from 'src/master-data/demograph/entities/demograph.entity';
import { Psychograph } from 'src/master-data/psychograph/entities/psychograph.entity';
import { DemographOption } from 'src/master-data/demograph/entities/demograph-option.entity';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AioAnalysisResponse]),
  TypeOrmModule.forFeature([CompanyInformation]),
  TypeOrmModule.forFeature([ContactPerson]),
  TypeOrmModule.forFeature([Demograph]),
  TypeOrmModule.forFeature([DemographOption]),
  TypeOrmModule.forFeature([DemographResponse]),
  TypeOrmModule.forFeature([Psychograph]),
  TypeOrmModule.forFeature([PsychographResponse]),
  TypeOrmModule.forFeature([PsychographResponseData]),
  TypeOrmModule.forFeature([User]),
  TypeOrmModule.forFeature([ActivityHistory]),
  ],
  controllers: [AioAnalysisResponseController],
  providers: [AioAnalysisResponseService],
})
export class AioAnalysisResponseModule { }
