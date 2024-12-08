import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateActivityHistoryDto } from './dto/create-activity-history.dto';
import { ActivityHistory } from './entities/activity-history.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ActivityHistoryService {
  constructor(
    @InjectRepository(ActivityHistory)
    private readonly activityHistoryRepository:
      Repository<ActivityHistory>,
    @InjectRepository(User)
    private readonly userRepository:
      Repository<User>,
  ) { }

  async create(createActivityHistoryDto: CreateActivityHistoryDto) {
    const user = await this.userRepository.findOne({ where: { user_id: createActivityHistoryDto.user_id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    try {
      const activityHistory = this.activityHistoryRepository.create({
        ...createActivityHistoryDto,
        user_id: user
      });
      const savedActivityHistory = await this.activityHistoryRepository.save(activityHistory);
      return {
        success: true,
        message: 'Activity history created successfully',
        data: savedActivityHistory,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create activity history');
    }
  }

  async findUser(userAuth: any) {
    const activityHistory = await this.activityHistoryRepository.find({ where: { user_id: userAuth.user_id }, relations: ['user_id'], });
    return activityHistory.map((activity) => ({
      activity_history_id: activity.activity_history_id,
      activity: activity.activity,
      created_at: activity.created_at,
      username: activity.user_id.username,
    }));
  }

  async findAll(userAuth: any, page: number = 1, size: number = 10, search: string = "", sortField: string = "created_at", sortOrder: "DESC" | "ASC" = "DESC") {
    size == -1 ? size = 1000000 : size;
    const skip = (page - 1) * size;
    const take = size;
    let query = this.activityHistoryRepository.createQueryBuilder('activity_history')
      .leftJoinAndSelect('activity_history.user_id', 'user');
    if (sortField && sortOrder) {
      if (sortField === "created_at") {
        query = query.addOrderBy(`activity_history.${sortField}`, sortOrder);
      } else {
        query = query.addOrderBy(`user.${sortField}`, sortOrder);
      }
    }
    if (userAuth.role === "user" || userAuth.role === "admin") {
      query = query.where('activity_history.user_id = :user_id', { user_id: userAuth.user_id });
    }
    if (search !== "") {
      query = query.andWhere('(activity_history.activity LIKE :search)', { search: `%${search}%` });
    }

    const [activityHistory, totalActivityHistory] = await query.skip(skip).take(take).getManyAndCount();

    const activityWithUsername = activityHistory.map(({ user_id, ...activity }) => ({
      ...activity,
      username: user_id.username,
    }));

    const totalPages = Math.ceil(totalActivityHistory / size);

    return {
      status: "success",
      message: 'Activity History retrieved successfully',
      totalActivityHistory,
      totalPages,
      currentPage: page,
      size,
      data: activityWithUsername,
    };
  }

  async findOne(activity_history_id: number) {
    return await this.activityHistoryRepository.findOne({ where: { activity_history_id } });
  }

  async remove(id: number) {
    const activityHistory = await this.findOne(id);
    if (!activityHistory) {
      throw new NotFoundException('Activity history not found');
    }
    try {
      const removedActivityHistory = await this.activityHistoryRepository.remove(activityHistory);
      return {
        status: "success",
        message: 'Activity history removed successfully',
        data: removedActivityHistory,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove activity history');
    }
  }

  async removeActivityHistoryUser(user_id: number) {
    try {
      const activityHistory = await this.activityHistoryRepository.find({
        relations: ['user_id']
      });
      const userActivityHistory = activityHistory.filter(ah => ah.user_id.user_id === user_id);
      if (userActivityHistory && userActivityHistory.length > 0) {
        const deletedActivity = userActivityHistory.map(activity =>
          this.activityHistoryRepository.remove(activity)
        );
        await Promise.all(deletedActivity);
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove activity history');
    }
  }
}
