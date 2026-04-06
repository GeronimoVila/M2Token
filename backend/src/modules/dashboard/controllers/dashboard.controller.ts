import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('company')
  async getCompanyDashboard(@Req() req: any) {
    return this.dashboardService.getCompanyDashboard(req.user.id);
  }
}