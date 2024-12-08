import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { DemographService } from './demograph.service';
import { CreateDemographDto } from './dto/create-demograph.dto';
import { UpdateDemographDto } from './dto/update-demograph.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('demograph')
@UseGuards(JwtAuthGuard)
export class DemographController {
  constructor(
    private readonly demographService: DemographService,) { }

  @Post()
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  create(@Body() createDemographDto: CreateDemographDto, @Request() req) {
    const userAuth = req.user;
    return this.demographService.create(createDemographDto, userAuth);
  }

  @Get()
  findAll(@Query('page') page: number, @Query('size') size: number, @Query('search') search: string, @Query('sortField') sortField: string, @Query('sortOrder') sortOrder: "DESC" | "ASC") {
    return this.demographService.findAll(page, size, search, sortField, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.demographService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  update(@Param('id') id: string, @Body() updateDemographDto: UpdateDemographDto, @Request() req) {
    const userAuth = req.user;
    return this.demographService.update(+id, updateDemographDto, userAuth);
  }

  @Delete(':id')
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  remove(@Param('id') id: string, @Request() req) {
    const userAuth = req.user;
    return this.demographService.remove(+id, userAuth);
  }
}