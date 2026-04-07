import { Controller, Get, Post, Body, UseGuards, Req, Param, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';
import { AssignmentsService } from '../../project-assignments/services/assignments.service';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { UserRole } from 'src/modules/users/enums/role.enum';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly assignmentsService: AssignmentsService
  ) {}

  @Roles(UserRole.COMPANY_OWNER, UserRole.COMPANY_ADMIN)
  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    const companyId = req.user.companyId;
    if (!companyId) throw new ForbiddenException('Solo empresas pueden crear proyectos');
    
    return this.projectsService.createProject({
      ...createProjectDto,
      companyId: new Types.ObjectId(companyId),
    }, req.user.id);
  }

  @Get()
  async findAll(@Req() req: any) {
    if (req.user.role === 'proveedor') {
       return []; 
    }
    if (req.user.role === 'superadmin') {
       return this.projectsService.findAll({}); 
    }

    const companyId = req.user.companyId;
    return this.projectsService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;

    if (user.role === 'superadmin') {
      return this.projectsService.findById(id);
    }

    if (user.role === 'proveedor') {
      const isAssigned = await this.assignmentsService.findOne({
        projectId: new Types.ObjectId(id),
        providerId: new Types.ObjectId(user.id)
      });

      if (!isAssigned) {
        throw new ForbiddenException('Acceso denegado: No estás asignado a esta obra.');
      }

      return this.projectsService.findById(id); 
    }

    const companyId = user.companyId;
    return this.projectsService.findOneById(id, companyId);
  }
}