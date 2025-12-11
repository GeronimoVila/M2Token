import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Types } from 'mongoose';

@Controller('projects')
@UseGuards(JwtAuthGuard) // ¡Protegido!
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async create(@Body() createProjectDto: CreateProjectDto, @Req() req: any) {
    // Obtenemos el companyId del usuario logueado (inyectado por el Token)
    const companyId = req.user.companyId;

    return this.projectsService.create({
      ...createProjectDto,
      companyId: new Types.ObjectId(companyId),
    });
  }

  @Get()
  async findAll(@Req() req: any) {
    // Solo devolvemos los proyectos de SU empresa
    const companyId = req.user.companyId;
    return this.projectsService.findAllByCompany(companyId);
  }
}