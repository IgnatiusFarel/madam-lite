import { Module } from '@nestjs/common';
import { ContactPersonService } from './contact-person.service';
import { ContactPersonController } from './contact-person.controller';
import { ContactPerson } from './entities/contact-person.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ContactPerson])],
  controllers: [ContactPersonController],
  providers: [ContactPersonService],
})
export class ContactPersonModule {}
