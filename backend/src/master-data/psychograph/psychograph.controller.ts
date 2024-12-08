import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { PsychographService } from './psychograph.service';
import { CreatePsychographDto } from './dto/create-psychograph.dto';
import { UpdatePsychographDto } from './dto/update-psychograph.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('psychograph')
@UseGuards(JwtAuthGuard)
export class PsychographController {
  constructor(private readonly psychographService: PsychographService) { }

  @Post()
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  create(@Body() createPsychographDto: CreatePsychographDto, @Request() req) {
    const userAuth = req.user;
    return this.psychographService.create(createPsychographDto, userAuth);
  }

  @Get()
  findAll(@Query('type') type: string, @Query('page') page: number, @Query('size') size: number, @Query('search') search: string, @Query('sortField') sortField: string, @Query('sortOrder') sortOrder: "DESC" | "ASC") {
    return this.psychographService.findAll(type, page, size, search, sortField, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.psychographService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  update(@Param('id') id: string, @Body() updatePsychographDto: UpdatePsychographDto, @Request() req) {
    const userAuth = req.user;
    return this.psychographService.update(+id, updatePsychographDto, userAuth);
  }

  @Delete(':id')
  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  remove(@Param('id') id: string, @Request() req) {
    const userAuth = req.user;
    return this.psychographService.remove(+id, userAuth);
  }
}
