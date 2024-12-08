import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AioAnalysisResponse } from './entities/aio-analysis-response.entity';
import { Connection, QueryRunner, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyInformation } from '../company-information/entities/company-information.entity';
import { DemographResponse } from './entities/demograph-response.entity';
import { PsychographResponse } from './entities/psychograph-response.entity';
import { PsychographResponseData } from './entities/psychograph-response-data.entity';
import { CreateAioAnalysisResponseDto } from './dto/create-aio-analysis-response.dto';
import { User } from 'src/users/entities/user.entity';
import { ActivityHistory } from 'src/activity-history/entities/activity-history.entity';
import { Demograph } from 'src/master-data/demograph/entities/demograph.entity';
import { Psychograph } from 'src/master-data/psychograph/entities/psychograph.entity';
import { DemographOption } from 'src/master-data/demograph/entities/demograph-option.entity';
import { format } from 'date-fns';
import { ContactPerson } from '../contact-person/entities/contact-person.entity';
import PdfPrinter from 'pdfmake';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import { ChartJSNodeCanvas, ChartCallback } from 'chartjs-node-canvas';
import { Chart, ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';

@Injectable()
export class AioAnalysisResponseService {
  private readonly chartJSNodeCanvas: ChartJSNodeCanvas;
  constructor(
    @InjectRepository(AioAnalysisResponse)
    private readonly aioRepository: Repository<AioAnalysisResponse>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CompanyInformation)
    private readonly companyInfoRepository: Repository<CompanyInformation>,
    @InjectRepository(ContactPerson)
    private readonly contactPersonRepository: Repository<ContactPerson>,
    @InjectRepository(Demograph)
    private readonly demographRepository: Repository<Demograph>,
    @InjectRepository(DemographOption)
    private readonly demographOptionRepository: Repository<DemographOption>,
    @InjectRepository(DemographResponse)
    private readonly demographResponseRepository: Repository<DemographResponse>,
    @InjectRepository(Psychograph)
    private readonly psychographRepository: Repository<Psychograph>,
    @InjectRepository(PsychographResponse)
    private readonly psychographResponseRepository: Repository<PsychographResponse>,
    @InjectRepository(PsychographResponseData)
    private readonly psychographResponseDataRepository: Repository<PsychographResponseData>,
    @InjectRepository(ActivityHistory)
    private readonly activityHistoryRepository: Repository<ActivityHistory>,
    private readonly connection: Connection,
  ) { this.chartJSNodeCanvas = this.createChartJSNodeCanvas(); }

  private createChartJSNodeCanvas(): ChartJSNodeCanvas {
    const width = 700;
    const height = 700;
    const chartCallback: ChartCallback = (ChartJS) => {
      ChartJS.defaults.responsive = true;
      ChartJS.defaults.maintainAspectRatio = false;
    };
    return new ChartJSNodeCanvas({
      width,
      height,
      chartCallback,
    });
  }

  async submit(data: CreateAioAnalysisResponseDto, user_id: number): Promise<any> {
    // Validasi data yang diterima
    if (!data || !data.company_information || !data.demograph || !data.psychograph) {
      throw new BadRequestException('Incomplete data provided');
    }
    let queryRunner: QueryRunner;

    try {
      queryRunner = this.connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      // Find the user
      const user = await this.userRepository.findOne({ where: { user_id } });
      if (!user) {
        throw new BadRequestException(`User not found`);
      }

      //Create AIO Analysis
      const aioAnalysisResponse = new AioAnalysisResponse();
      aioAnalysisResponse.user_id = user;
      aioAnalysisResponse.additional_notes = data.additional_notes;

      //Find or Create Company Information
      let companyInfo = new CompanyInformation();
      if (data.company_information.company_information_id) {
        // Find company by ID
        try {
          const company = await this.companyInfoRepository.findOne({ where: { company_information_id: data.company_information.company_information_id } });
          if (company) {
            aioAnalysisResponse.company_information = company;
            company.company_name = data.company_information.company_name;
            company.industry = data.company_information.industry;
            company.address = data.company_information.address;
            await this.companyInfoRepository.save(company);
            companyInfo = company;
          } else {
            return new NotFoundException('Company information not found')
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        try {
          companyInfo.company_name = data.company_information.company_name;
          companyInfo.industry = data.company_information.industry;
          companyInfo.address = data.company_information.address;
          const savedCompany = await queryRunner.manager.save(CompanyInformation, companyInfo);
          aioAnalysisResponse.company_information = savedCompany;
        } catch (error) {
          console.log(error)
          throw new InternalServerErrorException('Failed to add company information');
        }
      }

      //Find or Create Contact Person
      let contactPerson = new ContactPerson();
      if (data.company_information.contact_person_id) {
        console.log(data.company_information.contact_person_id)
        try {
          const findContactPerson = await this.contactPersonRepository.findOne({ where: { contact_person_id: data.company_information.contact_person_id } });
          if (findContactPerson) {
            console.log('CPPP', contactPerson)
            findContactPerson.full_name = data.company_information.full_name;
            findContactPerson.email_address = data.company_information.email_address;
            findContactPerson.position_or_title = data.company_information.position_or_title;
            findContactPerson.phone_number = data.company_information.phone_number;
            findContactPerson.company_information_id = companyInfo;
            const savedContact = await this.contactPersonRepository.save(findContactPerson);
            contactPerson = savedContact;
          } else {
            throw new NotFoundException('Contact person not found');
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        contactPerson.full_name = data.company_information.full_name;
        contactPerson.email_address = data.company_information.email_address;
        contactPerson.position_or_title = data.company_information.position_or_title;
        contactPerson.phone_number = data.company_information.phone_number;
        contactPerson.company_information_id = companyInfo;
        await queryRunner.manager.save(ContactPerson, contactPerson);
      }
      aioAnalysisResponse.contact_person = contactPerson;
      // Save AIO Analysis
      const savedAioAnalysis = await queryRunner.manager.save(AioAnalysisResponse, aioAnalysisResponse);

      // Add DemographResponse
      await Promise.all(
        data.demograph.map(async (demographData) => {
          const findDemograph = await this.demographRepository.findOne({ where: { demograph_id: demographData.demograph_id } })
          if (!findDemograph) {
            throw new NotFoundException('Demograph not found')
          }
          const findDemographOption = await this.demographOptionRepository.findOne({ where: { demograph_option_id: demographData.demograph_option_id } })
          if (!findDemographOption) {
            throw new NotFoundException('Demograph option not found')
          }
          const demograph = new DemographResponse();
          demograph.parameter_name = demographData.parameter_name;
          demograph.custom_result_parameter = findDemograph.custom_result_parameter ? findDemograph.custom_result_parameter : findDemograph.parameter_name;
          demograph.selected_value = findDemographOption.option_value;
          demograph.result_value = findDemographOption.result_value ? findDemographOption.result_value : findDemographOption.option_value;
          demograph.aio_analysis_response_id = savedAioAnalysis;
          return await queryRunner.manager.save(DemographResponse, demograph);
        }),
      );

      //Add PsychographResponse 
      await Promise.all(Object.keys(data.psychograph).map(async (psychographKey: string) => {
        const psychographDataArray = data.psychograph[psychographKey];
        const type = psychographKey;
        const totalSelectedOption = psychographDataArray.filter((response: any) => response.checked === true).length;
        const totalOption = psychographDataArray.length;
        // Create PsychographResponse
        const psychographResponse = new PsychographResponse();
        psychographResponse.type = type;
        psychographResponse.aio_analysis_response_id = savedAioAnalysis;
        psychographResponse.total_option = totalOption;
        psychographResponse.total_selected_option = totalSelectedOption;
        const savedPsychographResponse = await queryRunner.manager.save(PsychographResponse, psychographResponse);

        return Promise.all(psychographDataArray.map(async (psychographData: any) => {
          if (psychographData.checked === true) {
            const psychographResponseData = new PsychographResponseData();
            try {
              const findPsychograph = await this.psychographRepository.findOne({ where: { psychograph_id: psychographData.psychograph_id } })
              psychographResponseData.selected_option = findPsychograph.option_value;
              psychographResponseData.psychograph_response_id = savedPsychographResponse;
              return queryRunner.manager.save(PsychographResponseData, psychographResponseData);
            } catch (error) {
              throw new NotFoundException('Psychograph option not found')
            }
          }
          return savedPsychographResponse;
        }));
      }));

      // Create ActivityHistory
      const activityHistory = new ActivityHistory();
      activityHistory.user_id = user;
      activityHistory.activity = `Add new AIO Analysis for company ${companyInfo.company_name}`;
      //Save the ActivityHistory
      await queryRunner.manager.save(ActivityHistory, activityHistory);
      await queryRunner.commitTransaction()
      return {
        status: "success",
        message: 'AIO Analysis has been saved successfully. You can export summary to PDF',
        data: savedAioAnalysis,
      };

    } catch (error) {
      console.log(error)
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to process and save data');
    } finally {
      await queryRunner.release();
    }
  }

  async getAioAnalysisById(userAuth: any, aio_analysis_response_id: number) {
    try {
      const aioAnalysis = await this.aioRepository.findOne({
        where: { aio_analysis_response_id },
        relations: ['company_information', 'demograph_response', 'psychograph_response', 'user_id', 'contact_person'],
      });

      if (!aioAnalysis) {
        throw new NotFoundException('AIO Analysis not found');
      }
      if (userAuth.role === 'user') {
        const aioAnalysis = await this.aioRepository.findOne({ where: { aio_analysis_response_id: aio_analysis_response_id, user_id: userAuth.user_id } });
        if (!aioAnalysis) {
          throw new UnauthorizedException('Unauthorized to view AIO Analysis');
        }
      }
      return {
        aio_analysis_response_id: aioAnalysis.aio_analysis_response_id,
        user_id: aioAnalysis.user_id.user_id,
        company_information: {
          ...aioAnalysis.company_information,
          full_name: aioAnalysis.contact_person.full_name,
          email_address: aioAnalysis.contact_person.email_address,
          position_or_title: aioAnalysis.contact_person.position_or_title,
          phone_number: aioAnalysis.contact_person.phone_number,
        },
        demograph: aioAnalysis.demograph_response,
        psychograph: aioAnalysis.psychograph_response,
        additional_notes: aioAnalysis.additional_notes,
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to fetch AIO Analysis');
    }
  }


  async findAll(userAuth: any, page: number = 1, size: number = 10, search: string = "", sortField: string = "submitted_at", sortOrder: "DESC" | "ASC" = "DESC") {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userAuth.user_id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      size = size == -1 ? 1000000 : size;
      const skip = (page - 1) * size;
      const take = size;

      let query = this.aioRepository.createQueryBuilder('aio')
        .leftJoinAndSelect('aio.company_information', 'company_information')
        .leftJoinAndSelect('aio.psychograph_response', 'psychograph')
        .leftJoinAndSelect('aio.contact_person', 'contact_person');

      if (sortField && sortOrder) {
        if (sortField === 'company_name') {
          query = query.orderBy(`company_information.company_name`, sortOrder);
        } else if (sortField === 'contact_person_name') {
          query = query.orderBy(`contact_person.full_name`, sortOrder);
        } else if (sortField === 'industry') {
          query = query.orderBy(`company_information.industry`, sortOrder);
        } else if (sortField === 'total_aio_score') {
          query = query.orderBy(`psychograph.total_selected_option`, sortOrder);
        } else if (sortField === 'submitted_at') {
          query = query.orderBy(`aio.submitted_at`, sortOrder);
        }
      }

      if (userAuth.role === "user") {
        query = query.andWhere('aio.user_id = :user_id', { user_id: userAuth.user_id });
      }
      if (search !== "") {
        query = query
          .andWhere('(LOWER(company_information.company_name) LIKE LOWER(:search) OR LOWER(contact_person.full_name) LIKE LOWER(:search) OR LOWER(company_information.industry) LIKE LOWER(:search))', { search: `%${search}%` });
      }

      const [aioAnalysis, totalAioAnalysis] = await query.skip(skip).take(take).getManyAndCount();

      const totalPages = Math.ceil(totalAioAnalysis / size);

      const aioAnalysisWithCompanyInfo = aioAnalysis.map(aio => {
        let totalSelectedOption = 0;
        let totalOption = 0;

        aio.psychograph_response.forEach(psychograph => {
          totalSelectedOption += psychograph.total_selected_option;
          totalOption += psychograph.total_option;
        });

        const totalAioScore = totalOption !== 0 ? ((totalSelectedOption / totalOption) * 100).toFixed(2) : '0.00';

        return {
          ...aio,
          company_information: undefined,
          contact_person: undefined,
          company_name: aio.company_information ? aio.company_information.company_name : null,
          industry: aio.company_information ? aio.company_information.industry : null,
          contact_person_name: aio.contact_person ? aio.contact_person.full_name : null,
          psychograph_response: undefined,
          total_aio_score: `${totalAioScore}%`
        };
      });

      return {
        status: "success",
        message: 'AIO Analysis retrieved successfully',
        totalAioAnalysis,
        totalPages,
        currentPage: page,
        size,
        data: aioAnalysisWithCompanyInfo,
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to retrieve AIO Analysis');
    }
  }

  async getSubmitTotals(userAuth: any, interval: 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly') {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userAuth.user_id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let query = this.aioRepository.createQueryBuilder('aio')
        .select('COUNT(*) as total');

      if (interval === 'weekly') {
        query = query.addSelect('YEARWEEK(aio.submitted_at) as submit_week');
      } else if (interval === 'monthly') {
        query = query.addSelect(`MONTH(aio.submitted_at) as submit_month`);
      } else if (interval === 'yearly') {
        query = query.addSelect('YEAR(aio.submitted_at) as submit_year');
      }

      if (interval !== 'today') {
        query = query.where('MONTH(aio.submitted_at) = MONTH(CURRENT_DATE)')
          .andWhere('DAY(aio.submitted_at) <= DAY(CURRENT_DATE)');
      } else {
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        query = query.where(`DATE(aio.submitted_at) = '${formattedDate}'`);
      }
      if (userAuth.role === "user") {
        query = query.andWhere('aio.user_id = :user_id', { user_id: userAuth.user_id });
      }

      const submitTotal = await query.getRawOne();

      if (interval === 'daily') {
        return {
          status: 'success',
          data: submitTotal ? parseInt(submitTotal.total, 10) : 0,
        };
      } else {
        return {
          status: 'success',
          data: submitTotal ? parseInt(submitTotal.total, 10) : 0,
        };
      }
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to retrieve total submitted data');
    }
  }

  async getCompanySubmitTotals(userAuth: any, interval: 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time') {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userAuth.user_id } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      let query = this.aioRepository.createQueryBuilder('aio')
        .select('DATE_FORMAT(aio.submitted_at, "%Y-%m-%d") as submit_date')
        .addSelect('COUNT(DISTINCT company.company_name) as total_companies')
        .leftJoin('aio.company_information', 'company');

      if (interval === 'weekly') {
        query = query.addSelect('YEARWEEK(aio.submitted_at) as submit_week');
      } else if (interval === 'monthly') {
        query = query.addSelect(`MONTH(aio.submitted_at) as submit_month`);
      } else if (interval === 'yearly') {
        query = query.addSelect('YEAR(aio.submitted_at) as submit_year');
      }

      if (interval !== 'today') {
        query = query.where('MONTH(aio.submitted_at) = MONTH(CURRENT_DATE)')
          .andWhere('DAY(aio.submitted_at) <= DAY(CURRENT_DATE)');
      } else {
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        query = query.where(`DATE(aio.submitted_at) = '${formattedDate}'`);
      }
      if (userAuth.role === "user") {
        query = query.andWhere('aio.user_id = :user_id', { user_id: userAuth.user_id });
      }

      let submitTotals;
      if (interval === 'daily') {
        const today = new Date();
        const currentDate = today.getDate();

        const dailyTotals = [];
        for (let i = 1; i <= currentDate; i++) {
          const formattedDate = format(new Date(today.getFullYear(), today.getMonth(), i), 'yyyy-MM-dd');
          const queryResult = await query.clone().andWhere(`DATE(aio.submitted_at) = '${formattedDate}'`).getRawOne();
          dailyTotals.push(queryResult ? parseInt(queryResult.total_companies, 10) : 0);
        }

        submitTotals = dailyTotals;
      } else {
        const queryResults = await query.getRawMany();
        submitTotals = queryResults.map(result => ({
          submit_date: result.submit_date,
          total_companies: parseInt(result.total_companies, 10),
          submit_week: result.submit_week,
        }));
      }

      return {
        status: 'success',
        data: submitTotals,
      };
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to retrieve total company data');
    }
  }

  async getChartCompanyAnalysis(
    userAuth: any,
    chartInterval: 'week' | 'month' | 'year' | 'custom',
    week?: number,
    month?: number,
    year?: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      console.log('Input parameters:', { chartInterval, month, year, startDate, endDate });
      const user = await this.userRepository.findOne({
        where: { user_id: userAuth.user_id },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      let query = this.aioRepository
        .createQueryBuilder('aio')
        .select('DATE_FORMAT(aio.submitted_at, "%Y-%m-%d") as submit_date')
        .addSelect('COUNT(DISTINCT company.company_name) as total_companies')
        .leftJoin('aio.company_information', 'company');

      if (chartInterval === 'week') {
        query = query.addSelect('DATE_FORMAT(aio.submitted_at, "%d-%m-%Y") as day_label')
          .addSelect('COUNT(DISTINCT CONCAT(DATE_FORMAT(aio.submitted_at, "%Y-%m-%d"), company.company_name)) as total_companies')
          .groupBy('DATE_FORMAT(aio.submitted_at, "%d-%m-%Y")');
      } else if (chartInterval === 'month') {
        query = query.addSelect('DATE_FORMAT(aio.submitted_at, "%d") as day_of_month')
          .addSelect('COUNT(DISTINCT CONCAT(DATE_FORMAT(aio.submitted_at, "%Y-%m-%d"), company.company_name)) as total_companies')
          .groupBy('DATE_FORMAT(aio.submitted_at, "%Y-%m-%d")');

        if (month !== undefined && year !== undefined) {
          query = query
            .where('MONTH(aio.submitted_at) = :month', { month })
            .andWhere('YEAR(aio.submitted_at) = :year', { year });
        } else {
          query = query.where('MONTH(aio.submitted_at) = MONTH(CURRENT_DATE)')
            .andWhere('YEAR(aio.submitted_at) = YEAR(CURRENT_DATE)')
            .andWhere('DAY(aio.submitted_at) <= DAY(CURRENT_DATE)');
        }
      } else if (chartInterval === 'year') {
        query = query.addSelect('MONTH(aio.submitted_at) as month_of_year')
          .addSelect('COUNT(DISTINCT CONCAT(DATE_FORMAT(aio.submitted_at, "%Y-%m-%d"), company.company_name)) as total_companies')
          .groupBy('MONTH(aio.submitted_at)');

        if (year !== undefined) {
          query = query.where('YEAR(aio.submitted_at) = :year', { year });
        } else {
          return {
            status: 'failed',
            data: [],
            labels: [],
          }
        }
      } else if (chartInterval === 'custom') {
        if (!startDate || !endDate) {
          return {
            status: 'failed',
            data: [],
            labels: [],
          }
        }
        query = query
          .where('aio.submitted_at BETWEEN :startDate AND :endDate', {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
          .addSelect('DATE_FORMAT(aio.submitted_at, "%d-%m-%Y") as day_label')
          .groupBy('DATE_FORMAT(aio.submitted_at, "%d-%m-%Y")');
      }

      if (userAuth.role === 'user') {
        query = query.andWhere('aio.user_id = :user_id', { user_id: userAuth.user_id });
      }

      const queryResults = await query.getRawMany();
      const chartData = this.processChartData(chartInterval, queryResults, week, month, year, startDate, endDate);

      return {
        status: 'success',
        data: chartData.data,
        labels: chartData.labels,
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to retrieve total company data');
    }
  }

  private processChartData(chartInterval: string, queryResults: any[], week?: number, month?: number, year?: number, startDate?: string, endDate?: string) {
    const data: number[] = [];
    const labels: string[] = [];
    const currentDate = new Date();


    if (chartInterval === 'week') {
      if (week === undefined) {
        week = this.getCurrentWeekNumber(currentDate);
      }

      const startDate = this.getStartDateOfWeek(week, currentDate.getFullYear());
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Add 6 days to get the last day of the week

      const weekData = new Map<string, number>();

      queryResults.forEach((result) => {
        const dayLabel = result.day_label; // Ensure this matches the label format used in the query
        const totalCompanies = parseInt(result.total_companies, 10);

        if (weekData.has(dayLabel)) {
          weekData.set(dayLabel, weekData.get(dayLabel)! + totalCompanies);
        } else {
          weekData.set(dayLabel, totalCompanies);
        }
      });

      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dayLabel = this.formatDate(date);
        const dayTotal = weekData.get(dayLabel) || 0;
        data.push(dayTotal);
        labels.push(dayLabel);
      }
    } else if (chartInterval === 'month') {
      const daysInMonth = new Date(year, month, 0).getDate();
      const monthData = new Map<string, number>();

      queryResults.forEach((result) => {
        const dayOfMonth = result.day_of_month;
        const totalCompanies = parseInt(result.total_companies, 10);
        const dayLabel = `${dayOfMonth}`;

        if (monthData.has(dayLabel)) {
          monthData.set(dayLabel, monthData.get(dayLabel)! + totalCompanies);
        } else {
          monthData.set(dayLabel, totalCompanies);
        }
      });

      for (let i = 1; i <= daysInMonth; i++) {
        const dayLabel = `${i}`;
        const dayTotal = monthData.get(dayLabel) || 0;
        data.push(dayTotal);
        labels.push(dayLabel);
      }
    } else if (chartInterval === 'year') {
      const yearData = Array(12).fill(0);
      queryResults.forEach((result) => {
        const monthOfYear = result.month_of_year - 1; // Bulan dimulai dari 0
        const totalCompanies = parseInt(result.total_companies, 10);
        yearData[monthOfYear] += totalCompanies;
      });
      yearData.forEach((monthTotal, index) => {
        const monthLabel = new Date(0, index).toLocaleString('default', { month: 'long' });
        data.push(monthTotal);
        labels.push(monthLabel);
      });
    } else if (chartInterval === 'custom') {
      const customData = new Map<string, number>();
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end.getTime() - start.getTime();
      const diffDays = timeDiff / (1000 * 3600 * 24);
      console.log('Diff in days:', diffDays)

      if (diffDays > 30) {
        queryResults.forEach((result) => {
          const dayLabel = result.day_label;
          const totalCompanies = parseInt(result.total_companies, 10);

          if (customData.has(dayLabel)) {
            customData.set(dayLabel, customData.get(dayLabel)! + totalCompanies);
          } else {
            customData.set(dayLabel, totalCompanies);
          }
        });

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 7)) {
          const weekStart = new Date(date);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          if (weekEnd > end) {
            weekEnd.setTime(end.getTime());
          }

          const weekLabel = this.getFormattedRangeLabel(weekStart, weekEnd);

          let weekTotal = 0;
          for (let weekDate = new Date(weekStart); weekDate <= weekEnd && weekDate <= end; weekDate.setDate(weekDate.getDate() + 1)) {
            const dayLabel = this.formatDate(weekDate);
            weekTotal += customData.get(dayLabel) || 0;
          }

          data.push(weekTotal);
          labels.push(weekLabel);
        }
      } else {
        queryResults.forEach((result) => {
          const dayLabel = result.day_label; // Ensure this matches the label format used in the query
          const totalCompanies = parseInt(result.total_companies, 10);

          if (customData.has(dayLabel)) {
            customData.set(dayLabel, customData.get(dayLabel)! + totalCompanies);
          } else {
            customData.set(dayLabel, totalCompanies);
          }
        });

        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
          const dayLabel = this.formatDate(date);
          const dayTotal = customData.get(dayLabel) || 0;
          data.push(dayTotal);
          labels.push(dayLabel);
        }
      }
    }

    return { data, labels };
  }

  private getFormattedRangeLabel(start: Date, end: Date): string {
    const startDay = String(start.getDate()).padStart(2, '0');
    const startMonth = start.toLocaleString('default', { month: 'short' });
    const startYear = start.getFullYear();

    const endDay = String(end.getDate()).padStart(2, '0');
    const endMonth = end.toLocaleString('default', { month: 'short' });
    const endYear = end.getFullYear();

    if (startYear === endYear) {
      if (startMonth === endMonth) {
        return `${startDay}-${endDay} ${endMonth} ${endYear}`;
      } else {
        return `${startDay}-${startMonth} - ${endDay} ${endMonth} ${endYear}`;
      }
    } else {
      return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
    }
  }


  private formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private getCurrentWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const diffInDays = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    return Math.ceil((diffInDays + 1) / 7);
  }

  private getStartDateOfWeek(weekNumber: number, year: number): Date {
    const startOfYear = new Date(year, 0, 1);
    const daysToAdd = (weekNumber - 1) * 7;
    const startDate = new Date(startOfYear.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    // Adjust for the first day of the week (assuming Sunday start)
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    return startDate;
  }

  async exportPDF(id: number): Promise<PDFKit.PDFDocument | any> {
    const aioAnalysis = await this.aioRepository.findOne({ where: { aio_analysis_response_id: id }, relations: ['company_information', 'demograph_response', 'psychograph_response', 'contact_person', 'psychograph_response.psychograph_response_data'] });
    const activityPsychographData = aioAnalysis.psychograph_response
      .filter(response => response.type === 'activity')
      .map(response => response.psychograph_response_data)
      .flat();
    const interestPsychographData = aioAnalysis.psychograph_response
      .filter(response => response.type === 'interest')
      .map(response => response.psychograph_response_data)
      .flat();
    const opinionPsychographData = aioAnalysis.psychograph_response
      .filter(response => response.type === 'opinion')
      .map(response => response.psychograph_response_data)
      .flat();
    //const totalOptions = aioAnalysis.psychograph_response.reduce((total, response) => total + response.total_option, 0);
    let activityPercentage = aioAnalysis.psychograph_response.find(response => response.type === 'activity').total_selected_option / aioAnalysis.psychograph_response.find(response => response.type === 'activity').total_option * 100;
    let interestPercentage = aioAnalysis.psychograph_response.find(response => response.type === 'interest').total_selected_option / aioAnalysis.psychograph_response.find(response => response.type === 'interest').total_option * 100;
    let opinionPercentage = aioAnalysis.psychograph_response.find(response => response.type === 'opinion').total_selected_option / aioAnalysis.psychograph_response.find(response => response.type === 'opinion').total_option * 100;
    activityPercentage === 0 ? activityPercentage = 1 : activityPercentage;
    interestPercentage === 0 ? interestPercentage = 1 : interestPercentage;
    opinionPercentage === 0 ? opinionPercentage = 1 : opinionPercentage;
    const date = format(new Date(aioAnalysis.submitted_at), 'dd MMMM yyyy');
    let totalSelectedOption = 0;
    let totalOption = 0;

    const window = new JSDOM('').window;
    let additional_notes = htmlToPdfmake(aioAnalysis.additional_notes, {
      window, defaultStyles: {
        p: {
          margin: [0, 5, 0, 0],
        }
      }
    });
    additional_notes = additional_notes.map(note => ({
      ...note,
      lineHeight: 1
    }));

    aioAnalysis.psychograph_response.forEach(psychograph => {
      totalSelectedOption += psychograph.total_selected_option;
      totalOption += psychograph.total_option;
    });

    const totalAioScore = totalOption !== 0
      ? ((totalSelectedOption / totalOption) * 100).toFixed(1).replace(/\.0$/, '') + '%'
      : '0%';
    const chartJSNodeCanvas = this.chartJSNodeCanvas;
    const configuration: ChartConfiguration = {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: ['Activity', 'Interest', 'Opinion'],
        datasets: [{
          label: 'AIO Analysis',
          borderRadius: 15,
          data: [activityPercentage, interestPercentage, opinionPercentage],
          backgroundColor: [
            '#a296b6',
            '#51acfb',
            '#92d4e9'
          ],
          borderColor: [
            '#a296b6',
            '#51acfb',
            '#92d4e9'
          ],
          borderWidth: 1,

        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false,
          },
          datalabels: {
            clamp: false,
            anchor: function (context) {
              if (context.dataset.data[context.dataIndex] === 1) {
                return 'end';
              } else {
                return 'center';
              }
            },
            align: function (context) {
              if (context.dataset.data[context.dataIndex] === 1) {
                return 'top';
              } else {
                return 'center';
              }
            },
            textAlign: 'center',
            color: '#666',
            font: {
              size: 27,
              weight: 'normal',
            },
            formatter: (value) => {
              if (value === 1) {
                return '0%'
              }
              else if (Number.isInteger(value)) {
                return `${value}%`;
              } else {
                return `${value.toFixed(2).replace(/\.0$/, '')}%`
              }
            },
          },
        },
      },
    };
    Chart.register(ChartDataLabels);
    const buffer = await chartJSNodeCanvas.renderToBuffer(configuration);
    const imageDataUrl = `data:image/png;base64,${buffer.toString('base64')}`;
    const fonts = {
      Roboto: {
        normal: 'assets/fonts/Roboto-Regular.ttf',
        bold: 'assets/fonts/Roboto-Medium.ttf',
        italics: 'assets/fonts/Roboto-Italic.ttf',
        bolditalics: 'assets/fonts/Roboto-MediumItalic.ttf'
      },
      Lato: {
        normal: 'assets/fonts/Lato-Medium.ttf',
        bold: 'assets/fonts/Lato-Heavy.ttf',
        italics: 'assets/fonts/Lato-MediumItalic.ttf',
        bolditalics: 'assets/fonts/Lato-HeavyItalic.ttf'
      },
      LibreBaskerville: {
        normal: 'assets/fonts/LibreBaskerville-Regular.ttf',
        bold: 'assets/fonts/LibreBaskerville-Bold.ttf',
        italics: 'assets/fonts/LibreBaskerville-Italic.ttf',
      },
    };

    const printer = new PdfPrinter(fonts);
    const title = `Marketing Data Management Analysis - ${aioAnalysis.company_information.company_name}`;

    const recommendationHeader = [
      {
        columns: [
          {
            width: 30,
            image: 'assets/images/recommendation.png',
          },
          {
            text: 'RECOMMENDATION',
            style: 'header',
            marginLeft: 11,
            marginTop: 7,
            font: 'Lato',
            fontSize: 15,
            color: '#cf060b',
            bold: true,
          },
        ],
        unbreakable: true,
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 2,
            x2: 380,
            y2: 2,
            lineWidth: 1,
            lineColor: '#cf060b',
          },
        ],
        marginBottom: 4,
      },
    ];

    const psychograph1Header = [
      {
        columns: [
          {
            width: 30,
            image: 'assets/images/activity-psychograph.png',
          },
          { text: 'PSYCHOGRAPHICS SUMMARY : ACTIVITY', marginLeft: 11, marginTop: 7, style: 'header', font: 'Lato', fontSize: 15, color: '#cf060b', bold: true },
        ],
        unbreakable: true,
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 2,
            x2: 380, y2: 2,
            lineWidth: 1,
            lineColor: '#cf060b',
          },
        ],
        marginBottom: 10
      },
    ]

    const psychograph2Header = [
      {
        columns: [
          {
            width: 30,
            image: 'assets/images/interest-psychograph.png',
          },
          { text: 'PSYCHOGRAPHICS SUMMARY : INTEREST', marginLeft: 11, marginTop: 7, style: 'header', font: 'Lato', fontSize: 15, color: '#cf060b', bold: true },
        ],
        unbreakable: true,
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 2,
            x2: 380, y2: 2,
            lineWidth: 1,
            lineColor: '#cf060b',
          }
        ],
        marginBottom: 10
      },
    ]

    const psychograph3Header = [
      {
        columns: [
          {
            width: 30,
            image: 'assets/images/opinion-psychograph.png',
          },
          { text: 'PSYCHOGRAPHICS SUMMARY : OPINION', marginLeft: 11, marginTop: 7, style: 'header', font: 'Lato', fontSize: 15, color: '#cf060b', bold: true },
        ],
        unbreakable: true,
      },
      {
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 2,
            x2: 380, y2: 2,
            lineWidth: 1,
            lineColor: '#cf060b',
          }
        ],
        marginBottom: 10
      },
    ]

    const docDefinition = {
      info: {
        title: title,
        author: 'PT STAR SOFTWARE INDONESIA GROUP',
      },
      pageMargins: [40, 270, 40, 50],

      background: {
        image: 'assets/images/header-pdf.png',
        relativePosition: { x: 0, y: 0 },
        width: 600,
      },

      defaultStyle: {
        font: 'Lato',
      },

      header: {
        margin: [42, 200, 40, 40],
        text: [
          { text: aioAnalysis.company_information.company_name.toUpperCase(), font: 'Lato', bold: true, fontSize: 12, color: '#fff', characterSpacing: 1.3 },
          { text: ' | ' + date.toUpperCase(), font: 'Lato', fontSize: 12, color: '#fff', characterSpacing: 1.3 }
        ],
      },
      pageBreakBefore: function (currentNode) {
        //check if signature part is completely on the last page, add pagebreak if not
        if (currentNode.id === 'psychograph1' && (currentNode.pageNumbers.length != 1)) {
          return true;
        }
        else if (currentNode.id === 'psychograph2' && (currentNode.pageNumbers.length != 1)) {
          return true;
        }
        else if (currentNode.id === 'psychograph3' && (currentNode.pageNumbers.length != 1)) {
          return true;
        }
        else if (currentNode.id === 'recommendation' && (currentNode.pageNumbers.length != 1)) {
          return true;
        }
        return false;
      },

      content: [
        {
          columns: [
            {
              width: 30,
              image: 'assets/images/aio-analysis.png',
            },
            {
              text: 'AIO ANALYSIS', marginLeft: 11, marginTop: 7, style: 'header', fontSize: 15, color: '#cf060b', font: 'Lato', bold: true
            }
          ]
        },
        {
          canvas: [
            {
              type: 'line',
              x1: 0, y1: 2,
              x2: 380, y2: 2,
              lineWidth: 1,
              lineColor: '#cf060b',
            },
          ],
          marginTop: 2
        },
        { text: 'Psychography Data Analysis', fontSize: 17, color: '#cf060b', font: 'Lato', bold: true, marginTop: 20, marginBottom: 7, alignment: 'center' },
        {
          image: imageDataUrl,
          width: 280,
          height: 280,
          alignment: 'center',
        },
        {
          columns: [
            {
              columns: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 14,
                      h: 14,
                      r: 2,
                      color: '#a296b6'
                    }
                  ],
                  marginRight: 3
                },
                { text: 'Activity', style: 'header', font: 'Lato', fontSize: 13, color: '#444', width: 60 },
              ],
            },
            {
              columns: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 14,
                      h: 14,
                      r: 2,
                      color: '#51acfb'
                    }
                  ],
                  marginRight: 3
                },
                { text: 'Interest', style: 'header', font: 'Lato', fontSize: 13, color: '#444', width: 60 },
              ]
            },
            {
              columns: [
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: 0,
                      y: 0,
                      w: 14,
                      h: 14,
                      r: 2,
                      color: '#92d4e9'
                    }
                  ],
                  marginRight: 3
                },
                { text: 'Opinion', style: 'header', font: 'Lato', fontSize: 13, color: '#444', width: 60 },
              ]
            }
          ],
          margin: [150, 35, 130, 0],
          alignment: 'left',
        },
        {
          columns: [
            { alignment: 'right', text: totalAioScore, style: 'header', font: 'LibreBaskerville', fontSize: 50, color: '#bd3c03', marginRight: 20, width: 170, bold: true },
            {
              alignment: 'left',
              stack: [
                { text: 'AIO SCORE', style: 'header', font: 'Lato', fontSize: 20, color: '#080808', bold: true, marginBottom: 10 },
                { text: 'AIO Score is obtained based on the average value of the three aspects that have been analysed', style: 'header', font: 'Lato', fontSize: 14, color: '#080808' },]
            }
          ],
          margin: [20, 25, 10, 0]
        },


        {
          stack: [
            {
              columns: [
                {
                  width: 30,
                  image: 'assets/images/demograph.png',
                },
                { text: 'DEMOGRAPHICS SUMMARY', marginLeft: 11, marginTop: 7, style: 'header', font: 'Lato', fontSize: 15, color: '#cf060b', bold: true },
              ],
              unbreakable: true,
            },
            {
              canvas: [
                {
                  type: 'line',
                  x1: 0, y1: 2,
                  x2: 380, y2: 2,
                  lineWidth: 1,
                  lineColor: '#cf060b',
                }
              ],
              marginBottom: 10
            },
            ...aioAnalysis.demograph_response.length > 0 ? aioAnalysis.demograph_response.map((response, index) => ({
              text: [
                { text: `${String.fromCharCode(97 + index)}. ` },
                { text: response.custom_result_parameter + ' ' + response.result_value },
              ],
              margin: [10, 0, 0, 2],
              color: '#080808',
              unbreakable: true,
            })) : [{ text: 'no data', margin: [10, 0, 0, 2], color: '#444444', italics: true }],
          ],
        },
        {
          text: '',
          marginBottom: 17,
        },

        {
          stack: [
            psychograph1Header,
            {
              stack: [
                ...activityPsychographData.length > 0 ? activityPsychographData.map((data) => ({
                  columns: [
                    {
                      width: 10,
                      image: 'assets/images/checkbox.png',
                      marginTop: 2,
                    },
                    { text: data.selected_option, marginLeft: 7 }
                  ],
                  margin: [10, 0, 0, 2],
                  color: '#080808',
                  unbreakable: true,
                })) : [{ text: 'no data', margin: [10, 0, 0, 2], color: '#444444', italics: true }],
              ]
            }
          ],
          id: 'psychograph1'
        },
        {
          text: '',
          marginBottom: 17,
        },

        {
          stack: [
            psychograph2Header,
            ...interestPsychographData.length > 0 ? interestPsychographData.map((data) => ({
              columns: [
                {
                  width: 10,
                  image: 'assets/images/checkbox.png',
                  marginTop: 2,
                },
                { text: data.selected_option, marginLeft: 7 }
              ],
              margin: [10, 0, 0, 2],
              color: '#080808',
              unbreakable: true,
            })) : [{ text: 'no data', margin: [10, 0, 0, 2], color: '#444444', italics: true }],
          ],
          id: 'psychograph2'
        },
        {
          text: '',
          marginBottom: 17,
        },
        {
          stack: [psychograph3Header,
            ...opinionPsychographData.length > 0 ? opinionPsychographData.map((data) => ({
              columns: [
                {
                  width: 10,
                  image: 'assets/images/checkbox.png',
                  marginTop: 2,
                },
                { text: data.selected_option, marginLeft: 7 }
              ],
              margin: [10, 0, 0, 2],
              color: '#080808',
              unbreakable: true,
            })) : [{ text: 'no data', margin: [10, 0, 0, 2], color: '#444444', italics: true }],
          ],
          id: 'psychograph3'
        }
        ,
        {
          text: '',
          marginBottom: 17,
        },
        {
          stack: [
            ...recommendationHeader,
            {
              stack: additional_notes,
              margin: [10, 0, 0, 0],
              font: 'Lato',

            },
          ],
          id: 'recommendation',
        }
      ],
    } as TDocumentDefinitions;

    const options = {
      // ...
    }

    return printer.createPdfKitDocument(docDefinition, options);
  }
}
