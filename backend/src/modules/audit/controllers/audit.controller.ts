import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from '../services/audit.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/enums/role.enum';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  @Roles(UserRole.SUPERADMIN)
  async getFilteredLogs(
    @Query('entity') entity?: string,
    @Query('empresa') empresa?: string,
    @Query('proyecto') proyecto?: string,
    @Query('usuario') usuario?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.auditService.getFilteredLogs(
      { entity, empresa, proyecto, usuario },
      parseInt(page, 10),
      parseInt(limit, 10)
    );
  }
}