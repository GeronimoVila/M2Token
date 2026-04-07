import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DashboardService } from '../services/dashboard.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard) 
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('company')
  async getCompanyDashboard(@Req() req: any) {
    return this.dashboardService.getCompanyDashboard(req.user.id);
  }

  @Get('superadmin')
  @Roles(UserRole.SUPERADMIN)
  async getSuperAdminDashboard() {
    return this.dashboardService.getSuperAdminDashboard();
  }
}