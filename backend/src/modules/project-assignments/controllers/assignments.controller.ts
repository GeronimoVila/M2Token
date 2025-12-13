import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { AssignmentsService } from '../services/assignments.service';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('assignments')
@UseGuards(JwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  async assign(@Req() req: any, @Body() dto: CreateAssignmentDto) {
    const companyId = req.user.companyId; 
    return this.assignmentsService.assignProvider(companyId, dto);
  }

  @Get('project/:projectId')
  async getProjectAssignments(@Param('projectId') projectId: string) {
    return this.assignmentsService.findProjectAssignmentsGrouped(projectId);
  }

  @Get('my-projects')
  @UseGuards(RolesGuard)
  @Roles('proveedor', 'PROVEEDOR')
  async getMyProjects(@Req() req) {
    const providerId = req.user.userId;
    return this.assignmentsService.findMyProjects(providerId);
  }
}