import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from 'src/modules/users/enums/role.enum';

@Controller('assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN)
  async assign(@Req() req: any, @Body() dto: CreateAssignmentDto) {
    const companyId = req.user.companyId; 
    return this.assignmentsService.assignProvider(companyId, dto, req.user.id);
  }

  @Get('project/:projectId')
  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN, UserRole.COMPANY_APPROVER, UserRole.COMPANY_VIEWER)
  async getProjectAssignments(@Param('projectId') projectId: string) {
    return this.assignmentsService.findProjectAssignmentsGrouped(projectId);
  }

  @Get('my-projects')
  @Roles(UserRole.PROVEEDOR)
  async getMyProjects(@Req() req: any) {
    const providerId = req.user.id;
    return this.assignmentsService.findMyProjects(providerId);
  }
}