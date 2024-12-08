import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePsychographDto } from './dto/create-psychograph.dto';
import { UpdatePsychographDto } from './dto/update-psychograph.dto';
import { Psychograph } from './entities/psychograph.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityHistoryService } from 'src/activity-history/activity-history.service';

@Injectable()
export class PsychographService {
  constructor(
    @InjectRepository(Psychograph)
    private readonly psychographRepository:
      Repository<Psychograph>,
    private readonly activityHistory: ActivityHistoryService,
  ) { }
  async create(createPsychographDto: CreatePsychographDto, userAuth: any) {
    //Cek psychograph
    const existingPsychograph = await this.psychographRepository.findOne({
      where: [
        { option_value: createPsychographDto.option_value }
      ]
    });
    if (existingPsychograph) {
      const conflictMessages = [];

      if (existingPsychograph.option_value.toLowerCase() === createPsychographDto.option_value.toLowerCase()) {
        conflictMessages.push({ message: 'Option name is already exists' });
      }
      throw new ConflictException(conflictMessages);
    }
    try {
      const psychograph = new Psychograph();
      psychograph.option_value = createPsychographDto.option_value;
      psychograph.type = createPsychographDto.type;

      const savedPsychograph = await this.psychographRepository.save(psychograph);

      // Create ActivityHistory
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Created new psychograph option '${savedPsychograph.option_value}' in type '${savedPsychograph.type}'` });
      return {
        status: "success",
        message: 'Psychograph created successfully',
        data: savedPsychograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create psychograph');
    }
  }

  async findAll(type: string = "", page: number = 1, size: number = 10, search: string = "", sortField: string = "updated_at", sortOrder: "DESC" | "ASC" = "DESC") {
    try {
      size == -1 ? size = 1000000 : size;
      const skip = (page - 1) * size;
      const take = size;
      let query = this.psychographRepository.createQueryBuilder('psychograph');

      if (type !== "") {
        query = query.where('psychograph.type = :type', { type });
      }

      if (search !== "") {
        query = query.andWhere('LOWER(psychograph.option_value) LIKE LOWER(:search)', { search: `%${search}%` });
      }

      if (sortField && sortOrder) {
        query = query.orderBy(`psychograph.${sortField}`, sortOrder);
      }

      const [psychograph, totalPsychograph] = await query.skip(skip).take(take).getManyAndCount();

      if (psychograph.length === 0) {
        return {
          status: "success",
          message: 'No psychograph data found for the given criteria',
          totalPsychograph: 0,
          totalPages: 0,
          currentPage: page,
          size,
          data: [],
        };
      }

      const totalPages = Math.ceil(totalPsychograph / size);

      return {
        status: "success",
        message: 'Psychograph retrieved successfully',
        totalPsychograph,
        totalPages,
        currentPage: page,
        size,
        data: psychograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve psychograph');
    }
  }

  async findOne(psychograph_id: number): Promise<Psychograph | any> {
    return await this.psychographRepository.findOne({ where: { psychograph_id } });
  }

  async update(id: number, updatePsychographDto: UpdatePsychographDto, userAuth: any) {
    const psychograph = await this.findOne(id);
    if (!psychograph) {
      throw new NotFoundException('Psychograph not found');
    }
    const { option_value } = psychograph;
    //Cek psychograph
    const existingPsychograph = await this.psychographRepository.findOne({
      where: [
        { option_value: updatePsychographDto.option_value }
      ]
    });
    if (existingPsychograph && existingPsychograph.psychograph_id !== id) {
      const conflictMessages = [];

      if (existingPsychograph.option_value.toLowerCase() === updatePsychographDto.option_value.toLowerCase()) {
        conflictMessages.push({ message: 'Option name is already exists' });
      }
      throw new ConflictException(conflictMessages);
    }
    try {
      Object.assign(psychograph, updatePsychographDto);
      const updatedPsychograph = await this.psychographRepository.save(psychograph);

      // Create ActivityHistory
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Updated psychograph option '${option_value}'->'${updatedPsychograph.option_value}' in type '${updatedPsychograph.type}'` });

      return {
        status: "success",
        message: 'Psychograph updated successfully',
        data: updatedPsychograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update psychograph');
    }
  }

  async remove(id: number, userAuth: any) {
    const psychograph = await this.findOne(id);
    if (!psychograph) {
      throw new NotFoundException('Psychograph not found');
    }

    try {
      const removedPsychograph = await this.psychographRepository.remove(psychograph);

      // Create ActivityHistory
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Removed psychograph option '${psychograph.option_value}' in type '${psychograph.type}'` });
      return {
        status: "success",
        message: 'Psychograph removed successfully',
        data: removedPsychograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove psychograph');
    }
  }
}
