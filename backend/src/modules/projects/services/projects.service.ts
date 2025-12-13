import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProject } from '../models/project.model';
import { BaseRepository } from '../../../common/repositories/base.repository';

@Injectable()
export class ProjectsService extends BaseRepository<IProject> {
  constructor(
    @InjectModel('projects') private readonly projectModel: Model<IProject>
  ) {
    super(projectModel);
  }

  async findAllByCompany(companyId: string): Promise<IProject[]> {
    return this.findAll({ companyId: new Types.ObjectId(companyId) });
  }

  async findOneById(projectId: string, companyId: string): Promise<IProject> {
    const project = await this.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.companyId.toString() !== companyId) {
      throw new ForbiddenException('No tienes permiso para ver este proyecto');
    }

    return project;
  }
}