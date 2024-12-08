import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDemographDto } from './dto/create-demograph.dto';
import { UpdateDemographDto } from './dto/update-demograph.dto';
import { Demograph } from './entities/demograph.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemographOption } from './entities/demograph-option.entity';
import { ActivityHistoryService } from 'src/activity-history/activity-history.service';

@Injectable()
export class DemographService {
  constructor(
    @InjectRepository(Demograph)
    private readonly demographRepository:
      Repository<Demograph>,
    @InjectRepository(DemographOption)
    private readonly demographOptionRepository: Repository<DemographOption>,
    private readonly activityHistory: ActivityHistoryService,
  ) {
  }
  async create(createDemographDto: CreateDemographDto, userAuth: any) {
    //Cek demograph
    const existingDemograph = await this.demographRepository.findOne({
      where: [
        { parameter_name: createDemographDto.parameter_name }
      ]
    });

    if (existingDemograph) {
      const conflictMessages = [];

      if (existingDemograph.parameter_name.toLowerCase() === createDemographDto.parameter_name.toLowerCase()) {
        conflictMessages.push({ message: 'Parameter name is already exists' });
      }
      throw new ConflictException(conflictMessages);
    }
    try {
      const { parameter_name, custom_result_parameter, list_of_options } = createDemographDto;

      const demograph = new Demograph();
      demograph.parameter_name = parameter_name;
      demograph.custom_result_parameter = custom_result_parameter;

      const savedDemograph = await this.demographRepository.save(demograph);

      // Create demograph option
      if (list_of_options) {
        const demographOptions = list_of_options.map(optionDto => {
          const option = new DemographOption();
          option.demograph_id = savedDemograph;
          option.option_value = optionDto.option_value;
          option.result_value = optionDto.result_value;
          return option;
        });

        // Save demograph option
        await this.demographOptionRepository.save(demographOptions);
      }
      //Add activity history
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Created new demograph '${savedDemograph.parameter_name}'` });
      return {
        status: "success",
        message: 'Demograph created successfully',
        data: savedDemograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to create demograph');
    }
  }

  async findAll(page: number = 1, size: number = 10, search: string = "", sortField: string = "updated_at", sortOrder: "DESC" | "ASC" = "DESC") {
    try {
      size == -1 ? size = 1000000 : size;
      const skip = (page - 1) * size;
      const take = size;
      let query = this.demographRepository.createQueryBuilder('demograph')
        .leftJoinAndSelect('demograph.list_of_options', 'options');

      if (sortField && sortOrder) {
        if (sortField === 'number_of_options') {
          query = query.addSelect(`(SELECT COUNT(*) FROM demograph_option dlo WHERE dlo.demograph_id = demograph.demograph_id)`, 'sort_number_options')
            .orderBy('sort_number_options', sortOrder);
        } else {
          query = query.orderBy(`demograph.${sortField}`, sortOrder);
        }
      }

      if (search !== "") {
        query = query.where('LOWER(demograph.parameter_name) LIKE LOWER(:search)', { search: `%${search}%` });
      }

      const [demograph, totalDemograph] = await query.skip(skip).take(take).getManyAndCount();

      const demographWithOptions = demograph.map(demograph => ({
        ...demograph,
        number_of_options: demograph.list_of_options ? demograph.list_of_options.length : 0,
      }));

      const totalPages = Math.ceil(totalDemograph / size);

      return {
        status: "success",
        message: 'Demograph retrieved successfully',
        totalDemograph,
        totalPages,
        currentPage: page,
        size,
        data: demographWithOptions,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve demograph');
    }
  }

  async findOne(demograph_id: number): Promise<Demograph | any> {
    return await this.demographRepository.findOne({ where: { demograph_id } });
  }

  async update(id: number, updateDemographDto: UpdateDemographDto, userAuth: any) {
    const demograph = await this.findOne(id);
    if (!demograph) {
      throw new NotFoundException('Demograph not found')
    };
    //Cek demograph
    const existingDemograph = await this.demographRepository.findOne({
      where: [
        { parameter_name: updateDemographDto.parameter_name }
      ]
    });

    if (existingDemograph && existingDemograph.demograph_id !== id) {
      const conflictMessages = [];

      if (existingDemograph.parameter_name.toLowerCase() === updateDemographDto.parameter_name.toLowerCase()) {
        conflictMessages.push({ message: 'Parameter name is already exists' });
      }
      throw new ConflictException(conflictMessages);
    }
    try {
      const { parameter_name, custom_result_parameter, list_of_options } = updateDemographDto;

      // Update data demografi
      demograph.parameter_name = parameter_name;
      demograph.custom_result_parameter = custom_result_parameter;
      console.log(demograph);
      // Simpan perubahan pada data demografi
      const updatedDemograph = await this.demographRepository.save(demograph);

      // Hapus semua opsi demografi terkait
      await this.demographOptionRepository.delete({ demograph_id: demograph });

      // Buat dan simpan opsi demografi baru jika ada
      if (list_of_options) {
        const demographOptions = list_of_options.map(optionDto => {
          const option = new DemographOption();
          option.demograph_id = updatedDemograph;
          option.option_value = optionDto.option_value;
          option.result_value = optionDto.result_value;
          return option;
        });

        await this.demographOptionRepository.save(demographOptions);

        //Add activity history
        await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Updated demograph '${updatedDemograph.parameter_name}'` });
      }

      return {
        status: "success",
        message: 'Demograph updated successfully',
        data: updatedDemograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to update demograph');
    }

  }

  async remove(demograph_id: number, userAuth: any) {
    const demograph = await this.findOne(demograph_id);
    if (!demograph) {
      throw new NotFoundException('Demograph not found')
    }
    try {
      const demographOptions = await this.demographOptionRepository.find({
        where: { demograph_id: demograph.demograph_id },
      });
      console.log(demographOptions);
      if (demographOptions) {
        await Promise.all(
          demographOptions.map(async (option) =>
            this.demographOptionRepository.remove(option),
          ),
        );
      }
      const removedDemograph = await this.demographRepository.remove(demograph);

      //Add activity history
      await this.activityHistory.create({ user_id: userAuth.user_id, activity: `Removed demograph '${demograph.parameter_name}'` });

      return {
        status: "success",
        message: 'Demograph removed successfully',
        data: removedDemograph,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to remove demograph');
    }
  }
}
