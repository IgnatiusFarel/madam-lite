import { Module } from '@nestjs/common';
import { DemographService } from './demograph.service';
import { DemographController } from './demograph.controller';
import { Demograph } from './entities/demograph.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemographOption } from './entities/demograph-option.entity';
import { ActivityHistoryModule } from 'src/activity-history/activity-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Demograph]), TypeOrmModule.forFeature([DemographOption]), ActivityHistoryModule],
  controllers: [DemographController],
  providers: [DemographService],
})
export class DemographModule { }
