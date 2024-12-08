import { Controller, Get, Param } from '@nestjs/common';
import { ContactPersonService } from './contact-person.service';

@Controller('contact-person')
export class ContactPersonController {
  constructor(private readonly contactPersonService: ContactPersonService) { }

  @Get()
  findAll() {
    return this.contactPersonService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactPersonService.findOne(+id);
  }
}
