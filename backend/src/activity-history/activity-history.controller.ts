import { Get, Post, Body, Param, Delete, UseGuards, Controller, Request, Query } from '@nestjs/common';
import { ActivityHistoryService } from './activity-history.service';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('activity-history')
@UseGuards(JwtAuthGuard)
export class ActivityHistoryController {
  constructor(private readonly activityHistoryService: ActivityHistoryService) { }

  @Get()
  findAll(@Request() req, @Query('page') page: number, @Query('size') size: number, @Query('search') search: string, @Query('sortField') sortField: string, @Query('sortOrder') sortOrder: "DESC" | "ASC") {
    const userAuth = req.user;
    return this.activityHistoryService.findAll(userAuth, page, size, search, sortField, sortOrder);
  }

  @Post()
  create(@Body() createActivityHistoryDto: CreateActivityHistoryDto) {
    return this.activityHistoryService.create(createActivityHistoryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.activityHistoryService.findOne(+id);
  }

  @UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activityHistoryService.remove(+id);
  }
}
