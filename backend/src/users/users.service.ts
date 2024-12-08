import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { ActivityHistoryService } from 'src/activity-history/activity-history.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
    private readonly activityHistory: ActivityHistoryService,
  ) {

  }
  async create(createUserDto: CreateUserDto, userAuth: any) {
    const errors = await validate(createUserDto);
    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    //Cek user
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
        { name: createUserDto.name }
      ]
    });

    if (existingUser) {
      const conflictMessages = [];

      if (existingUser.username.toLowerCase() === createUserDto.username.toLowerCase()) {
        conflictMessages.push({ message: 'Username is already taken' });
      }
      if (existingUser.email.toLowerCase() === createUserDto.email.toLowerCase()) {
        conflictMessages.push({ message: 'Email is already taken' });
      }
      if (existingUser.name.toLowerCase() === createUserDto.name.toLowerCase()) {
        conflictMessages.push({ message: 'Name is already taken' });
      }

      throw new ConflictException(conflictMessages);
    }
    try {
      const { password, ...userData } = createUserDto;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await this.userRepository.save({ ...userData, password: hashedPassword });
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Created new user '${newUser.username}'` });
      return {
        status: "success",
        message: 'User created successfully',
        data: newUser
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(role: string, page: number = 1, size: number = 10, search: string = "", sortField: string = "updated_at", sortOrder: "DESC" | "ASC" = "DESC") {
    try {
      size == -1 ? size = 1000000 : size;
      const skip = (page - 1) * size;
      const take = size;
      let query = this.userRepository.createQueryBuilder('users');
      if (sortField && sortOrder) {
        query = query.orderBy(`users.${sortField}`, sortOrder);
      }
      let totalUsersQuery = this.userRepository.createQueryBuilder('users');
      if (role === "admin") {
        query = query.where('users.role = :role', { role: 'user' });
        totalUsersQuery = totalUsersQuery.where('users.role = :role', { role: 'user' });
      } else if (role === "superadmin") {
        query = query.where('users.role IN (:...roles)', { roles: ['user', 'admin'] });
        totalUsersQuery = totalUsersQuery.where('users.role IN (:...roles)', { roles: ['user', 'admin'] });
      }
      if (search !== "") {
        query = query.andWhere('(users.username LIKE :search OR users.name LIKE :search)', { search: `%${search}%` });
      }
      const [users, totalUsers] = await Promise.all([
        query.skip(skip).take(take).getMany(),
        totalUsersQuery.getCount()
      ]);

      const totalPages = Math.ceil(totalUsers / size);

      return {
        status: "success",
        message: 'Users retrieved successfully',
        totalUsers,
        totalPages,
        currentPage: page,
        size,
        data: users
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve users');
    }
  }

  async findOne(user_id: number) {
    return await this.userRepository.findOne({ where: { user_id } });
  }

  async update(user_id: number, updateUserDto: UpdateUserDto, userAuth: any) {
    const user = await this.findOne(user_id);
    if (!user) {
      throw new NotFoundException;
    }
    //Validate user
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: updateUserDto.username },
        { email: updateUserDto.email },
        { name: updateUserDto.name }
      ]
    });

    if (existingUser && existingUser.user_id !== user_id) {
      const conflictMessages = [];

      if (existingUser.username.toLowerCase() === updateUserDto.username.toLowerCase()) {
        conflictMessages.push({ message: 'Username is already taken' });
      }
      if (existingUser.email.toLowerCase() === updateUserDto.email.toLowerCase()) {
        conflictMessages.push({ message: 'Email is already taken' });
      }
      if (existingUser.name.toLowerCase() === updateUserDto.name.toLowerCase()) {
        conflictMessages.push({ message: 'Name is already taken' });
      }

      throw new ConflictException(conflictMessages);
    }
    try {
      let updateUser = updateUserDto;
      if (updateUserDto.password) {
        const { password, ...userData } = updateUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        updateUser = { ...userData, password: hashedPassword, password_changed_at: new Date() };

      }

      Object.assign(user, updateUser);
      const updatedUser = await this.userRepository.save(user);
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Updated user '${updatedUser.username}'` });
      return {
        status: "success",
        message: 'User updated successfully',
        data: updatedUser
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(user_id: number, userAuth: any) {
    const user = await this.findOne(user_id);
    if (!user) {
      throw new NotFoundException;
    }
    try {
      await this.activityHistory.removeActivityHistoryUser(user.user_id);
      const removedUser = await this.userRepository.remove(user);
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Removed user '${removedUser.username}'` });
      return {
        status: "success",
        message: 'User removed successfully',
        data: removedUser
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to remove user');
    }
  }

  async findByUsername(username: string): Promise<User> {
    return await this.userRepository.findOne({ where: { username } });
  }
}
