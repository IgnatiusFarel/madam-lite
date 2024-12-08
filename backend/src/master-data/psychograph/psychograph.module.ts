import { Module } from '@nestjs/common';
import { PsychographService } from './psychograph.service';
import { PsychographController } from './psychograph.controller';
import { Psychograph } from './entities/psychograph.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { ActivityHistoryModule } from 'src/activity-history/activity-history.module';

@Module({
  imports: [TypeOrmModule.forFeature([Psychograph]), TypeOrmModule.forFeature([User]), ActivityHistoryModule],
  controllers: [PsychographController],
  providers: [PsychographService],
})
export class PsychographModule { }
