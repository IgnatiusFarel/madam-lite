import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ContactPerson } from './entities/contact-person.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ContactPersonService {
  constructor(
    @InjectRepository(ContactPerson)
    private readonly companyPersonRepository:
      Repository<ContactPerson>,) { }

  findAll() {
    return `This action returns all contactPerson`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contactPerson`;
  }
}
