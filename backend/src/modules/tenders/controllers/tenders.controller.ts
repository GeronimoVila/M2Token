import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { TendersService } from '../services/tenders.service';
import { CreateTenderDto } from '../dtos/create-tender.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';
import { ParseMongoIdPipe } from '../../../utils/pipes/parse-mongo-id.pipe';

@Controller('tenders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TendersController {
  constructor(private readonly tendersService: TendersService) {}

  @Post()
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN)
  async create(@Body() createTenderDto: CreateTenderDto, @Body('companyId') companyId: string, @Request() req) {
    const finalCompanyId = companyId || req.user.companyId; 
    return this.tendersService.create(createTenderDto, finalCompanyId, req.user.id);
  }

  @Get('project/:projectId')
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER)
  async getByProject(@Param('projectId', ParseMongoIdPipe) projectId: string) {
    return this.tendersService.findByProject(projectId);
  }

  @Get('marketplace/open')
  @Roles(UserRole.PROVEEDOR)
  async getOpenTenders() {
    return this.tendersService.findOpenTenders();
  }

  @Get(':id')
  async getById(@Param('id', ParseMongoIdPipe) id: string) {
    return this.tendersService.findById(id);
  }
}