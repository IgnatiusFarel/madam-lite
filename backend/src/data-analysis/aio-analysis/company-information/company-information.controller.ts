import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { CompanyInformationService } from './company-information.service';
import { CreateCompanyInformationDto } from './dto/create-company-information.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('company-information')
@UseGuards(JwtAuthGuard)
export class CompanyInformationController {
  constructor(private readonly companyInformationService: CompanyInformationService) {}
  @Get()
  findAll() {
    return this.companyInformationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companyInformationService.findOne(+id);
  }

  @Post()
  create(@Body() createCompanyInformationDto: CreateCompanyInformationDto) {
    return this.companyInformationService.create(createCompanyInformationDto);
  }

}
