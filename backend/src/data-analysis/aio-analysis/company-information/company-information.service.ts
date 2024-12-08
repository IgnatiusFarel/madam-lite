import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { CompanyInformation } from './entities/company-information.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CompanyInformationService {
  constructor(
    @InjectRepository(CompanyInformation)
    private readonly companyInformationRepository:
      Repository<CompanyInformation>,
  ) { }

  async findAll(): Promise<CompanyInformation[]> {
    return await this.companyInformationRepository.find({ relations: ['contact_person'] });
  }

  async findOne(company_information_id: number): Promise<CompanyInformation | any> {
    return await this.companyInformationRepository.findOne({ where: { company_information_id } });
  }

  async create(createCompanyInformationDto: CreateCompanyInformationDto): Promise<any> {
    try {
      const newCompanyInformation = new CompanyInformation();
      newCompanyInformation.company_name = createCompanyInformationDto.company_name;
      newCompanyInformation.industry = createCompanyInformationDto.industry;
      newCompanyInformation.address = createCompanyInformationDto.address;

      const savedCompany = await this.companyInformationRepository.save(newCompanyInformation);

      return {
        success: true,
        message: 'Company information created successfully',
        data: savedCompany,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create company information');
    }
  }
}
