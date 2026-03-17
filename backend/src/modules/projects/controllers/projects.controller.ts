import { Controller, Get, Post, Body, UseGuards, Req, Param, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    const companyId = req.user.companyId;
    if (!companyId) throw new ForbiddenException('Solo empresas pueden crear proyectos');
    
    return this.projectsService.create({
      ...createProjectDto,
      companyId: new Types.ObjectId(companyId),
    });
  }

  @Get()
  async findAll(@Req() req: any) {
    if (req.user.role === 'proveedor') {
       return []; 
    }
    const companyId = req.user.companyId;
    return this.projectsService.findAllByCompany(companyId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const user = req.user;

    if (user.role === 'proveedor') {
       return this.projectsService.findById(id); 
    }

    const companyId = user.companyId;
    return this.projectsService.findOneById(id, companyId);
  }
}