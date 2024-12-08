import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('users')
@UseGuards(new JwtAuthGuard(['admin', 'superadmin']))
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const userAuth = req.user;
    return this.usersService.create(createUserDto, userAuth);
  }

  @Get()
  findAll(@Request() req, @Query('page') page: number, @Query('size') size: number, @Query('search') search: string, @Query('sortField') sortField: string, @Query('sortOrder') sortOrder: "DESC" | "ASC") {
    const role = req.user.role;
    return this.usersService.findAll(role, page, size, search, sortField, sortOrder);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userAuth = req.user;
    return this.usersService.update(+id, updateUserDto, userAuth);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    const userAuth = req.user;
    return this.usersService.remove(+id, userAuth);
  }


}
