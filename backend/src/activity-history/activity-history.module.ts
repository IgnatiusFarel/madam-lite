import { Module } from '@nestjs/common';
import { ActivityHistoryService } from './activity-history.service';
import { ActivityHistoryController } from './activity-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityHistory } from './entities/activity-history.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityHistory]), TypeOrmModule.forFeature([User]),],
  controllers: [ActivityHistoryController],
  providers: [ActivityHistoryService],
  exports: [ActivityHistoryService]
})
export class ActivityHistoryModule { }
