import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IProject } from '../models/project.model';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class ProjectsService extends BaseRepository<IProject> {
  constructor(
    @InjectModel('projects') private readonly projectModel: Model<IProject>,
    private readonly auditService: AuditService
  ) {
    super(projectModel);
  }

  async createProject(data: Partial<IProject>, userId: string): Promise<IProject> {
    const savedProject = await super.create(data);
    
    const company = await this.projectModel.db.collection('companies').findOne({ 
      _id: new Types.ObjectId(savedProject.companyId as any) 
    });

    if (savedProject.companyId) {
      await this.auditService.logAction(
        userId,
        userId, 
        'project', 
        savedProject._id.toString(), 
        'created', 
        { 
          nombreProyecto: savedProject.name, 
          presupuesto: savedProject.budget,
          nombreEmpresa: company?.name || 'Empresa Desconocida'
        }
      );
    }
    
    return savedProject;
  }

  async findAllByCompany(companyId: string): Promise<IProject[]> {
    return this.findAll({ companyId: new Types.ObjectId(companyId) });
  }

  async findOneById(projectId: string, companyId: string | Types.ObjectId): Promise<IProject> {
    const project = await this.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (!project.companyId || String(project.companyId) !== String(companyId)) {
      throw new ForbiddenException('No tienes permiso para ver este proyecto');
    }

    return project;
  }
}