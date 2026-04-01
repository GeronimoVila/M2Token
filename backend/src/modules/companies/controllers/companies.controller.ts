import { Controller, Post, Body, UseGuards, Req, Get, Patch, BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../services/companies.service';
import { CreateCompanyDto } from '../dtos/create-company.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @Req() req: any) {
    const userId = req.user.id; 
    
    return this.companiesService.createCompany(createCompanyDto, userId);
  }

  @Get('my-company')
  async getMyCompany(@Req() req: any) {
    const userId = req.user.id;
    return this.companiesService.findByUserId(userId);
  }

  @Patch('my-company')
  async updateMyCompany(@Req() req: any, @Body() updateData: any) {
    const userId = req.user.id;
    const company = await this.companiesService.findByUserId(userId);
    if (!company) {
      throw new NotFoundException('No se encontró una empresa asignada a este usuario');
    }

    return this.companiesService.update(company._id as string, updateData);
  }
}