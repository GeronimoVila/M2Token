import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAssignment } from '../models/assignment.model';
import { BaseRepository } from '../../../common/repositories/base.repository';
import { CreateAssignmentDto } from '../dtos/create-assignment.dto';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class AssignmentsService extends BaseRepository<IAssignment> {
  constructor(
    @InjectModel('project_assignments') private readonly assignmentModel: Model<IAssignment>,
    private readonly auditService: AuditService
  ) {
    super(assignmentModel);
  }

  async assignProvider(companyId: string, dto: CreateAssignmentDto, userId: string, montoAdjudicado?: number): Promise<IAssignment> {
    const { projectId, providerId } = dto;

    const existing = await this.findOne({ 
      projectId: new Types.ObjectId(projectId), 
      providerId: new Types.ObjectId(providerId) 
    });

    const project = await this.assignmentModel.db.model('projects').findById(projectId).select('name').exec();
    const provider = await this.assignmentModel.db.model('users').findById(providerId).select('name razonSocial').exec();

    if (existing) {
      if (montoAdjudicado) {
        await this.auditService.logAction(
          userId, 
          userId, 
          'assignment', 
          existing._id.toString(), 
          'updated', 
          { 
            nombreProyecto: project?.name || 'Proyecto Desconocido',
            nombreProveedor: provider?.name || provider?.razonSocial || 'Proveedor Desconocido',
            montoAdjudicado: montoAdjudicado,
            nota: 'Adjudicación adicional a proveedor que ya era parte del proyecto.'
          }
        );
      }
      return existing;
    }

    const savedAssignment = await this.create({
      projectId: new Types.ObjectId(projectId),
      providerId: new Types.ObjectId(providerId),
      companyId: new Types.ObjectId(companyId),
      status: 'active',
      assignedAt: new Date(),
    });

    await this.auditService.logAction(
      userId, 
      userId, 
      'assignment', 
      savedAssignment._id.toString(), 
      'created', 
      { 
        nombreProyecto: project?.name || 'Proyecto Desconocido',
        nombreProveedor: provider?.name || provider?.razonSocial || 'Proveedor Desconocido',
        montoAdjudicado: montoAdjudicado 
      }
    );

    return savedAssignment;
  }

  async findProviderAssignments(providerId: string) {
    return this.assignmentModel
      .find({ providerId: new Types.ObjectId(providerId) })
      .populate('projectId', 'name description address')
      .populate('companyId', 'name')
      .exec();
  }

  async findProjectAssignmentsGrouped(projectId: string) {
    const assignments = await this.assignmentModel
      .find({ 
        projectId: new Types.ObjectId(projectId),
        status: 'active' 
      })
      .populate('providerId', 'name email cuit category phone')
      .exec();

    const grouped = assignments.reduce((acc, curr) => {
      const provider = curr.providerId as any;
      const category = provider.category || 'Sin Categoría';

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push({
        assignmentId: curr._id,
        provider: provider,
        assignedAt: curr.assignedAt,
        status: curr.status
      });

      return acc;
    }, {} as Record<string, any[]>);

    return grouped;
  }

  async findMyProjects(providerId: string) {
    return this.assignmentModel
      .find({ providerId: providerId })
      .populate('projectId')
      .exec();
  }
}