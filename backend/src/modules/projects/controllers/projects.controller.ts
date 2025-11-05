import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dtos/create-project.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin', 'empresa')
  async createProject(@Body() createProjectDto: CreateProjectDto, @Req() req) {
    const userId = req.user.id;
    return this.projectsService.create(createProjectDto, userId);
  }

  @Get('my-projects')
  async getMyProjects(@Req() req) {
    const userId = req.user.id;
    return this.projectsService.findAllByUserId(userId);
  }
}