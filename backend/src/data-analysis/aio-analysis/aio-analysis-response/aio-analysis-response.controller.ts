import { Controller, Get, Post, Body, Param, Request, UseGuards, Query, Res, InternalServerErrorException } from '@nestjs/common';
import { AioAnalysisResponseService } from './aio-analysis-response.service';
import { CreateAioAnalysisResponseDto } from './dto/create-aio-analysis-response.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('aio-analysis')
@UseGuards(JwtAuthGuard)
export class AioAnalysisResponseController {
  constructor(private readonly aioAnalysisResponseService: AioAnalysisResponseService) { }

  @Get('export-pdf/:id')
  async exportPDF(
    @Request() req,
    @Param('id') id: number,
    @Res() response: Response,
  ) {
    try {
      const userAuth = req.user;
      await this.aioAnalysisResponseService.getAioAnalysisById(userAuth, +id);
      const pdfDoc = await this.aioAnalysisResponseService.exportPDF(+id);
      response.setHeader('Content-Type', 'application/pdf');
      pdfDoc.pipe(response);
      pdfDoc.end();
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('An error occurred while exporting the PDF file');
    }
  }

  @Get('chart-company-analysis')
  async getChartCompanyAnalysis(
    @Request() req,
    @Query('chartInterval') chartInterval: 'week' | 'month' | 'year' | 'custom',
    @Query('week') week: number,
    @Query('month') month: number,
    @Query('year') year: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    const userAuth = req.user;
    return this.aioAnalysisResponseService.getChartCompanyAnalysis(userAuth, chartInterval, week, month, year, startDate, endDate);
  }

  @Get('company-total')
  async getCompanyTotals(
    @Request() req, @Query('interval') interval: 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    const userAuth = req.user;
    if (!interval) {
      interval = 'today';
    }
    return this.aioAnalysisResponseService.getCompanySubmitTotals(userAuth, interval);
  }

  @Get('submit-total')
  async getSubmitTotals(
    @Request() req, @Query('interval') interval: 'today' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) {
    const userAuth = req.user;
    if (!interval) {
      interval = 'today';
    }
    return this.aioAnalysisResponseService.getSubmitTotals(userAuth, interval);
  }

  @Post()
  async submit(@Body() createAioAnalysisResponseDto: CreateAioAnalysisResponseDto, @Request() req) {
    const user_id = req.user.user_id;
    return await this.aioAnalysisResponseService.submit(createAioAnalysisResponseDto, user_id);
  }

  @Get()
  async findAll(@Request() req, @Query('page') page: number, @Query('size') size: number, @Query('search') search: string, @Query('sortField') sortField: string, @Query('sortOrder') sortOrder: "DESC" | "ASC") {
    const userAuth = req.user;
    return this.aioAnalysisResponseService.findAll(userAuth, page, size, search, sortField, sortOrder);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const userAuth = req.user;
    return this.aioAnalysisResponseService.getAioAnalysisById(userAuth, +id);
  }
}
