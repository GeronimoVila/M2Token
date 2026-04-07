import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IAuditLog } from '../models/auditLog.model';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel('auditLogs') private readonly auditLogModel: Model<IAuditLog>,
  ) {}

  async logAction(
    userId: string | Types.ObjectId,
    roleId: string | Types.ObjectId,
    entity: 'token' | 'remito' | 'project' | 'tender' | 'canje' | 'assignment' | 'user',
    entityId: string | Types.ObjectId,
    action: 'created' | 'updated' | 'deleted' | 'validated' | 'approved' | 'rejected',
    metadata?: Record<string, any>,
  ) {
    try {
      const log = new this.auditLogModel({
        userId,
        roleId,
        entity,
        entityId,
        action,
        metadata,
      });
      await log.save();
    } catch (error) {
      console.error('❌ Error guardando AuditLog:', error);
    }
  }

  async getFilteredLogs(filters: { entity?: string, empresa?: string, proyecto?: string, usuario?: string }, page: number = 1, limit: number = 20) {
    const matchStage: any = {};
    
    if (filters.entity && filters.entity !== 'all') matchStage.entity = filters.entity;
    if (filters.empresa) matchStage['metadata.nombreEmpresa'] = { $regex: filters.empresa, $options: 'i' };
    if (filters.proyecto) matchStage['metadata.nombreProyecto'] = { $regex: filters.proyecto, $options: 'i' };

    const pipeline: any[] = [];
    if (Object.keys(matchStage).length > 0) pipeline.push({ $match: matchStage });

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userObj'
      }
    });
    pipeline.push({ $unwind: { path: '$userObj', preserveNullAndEmptyArrays: true } });

    if (filters.usuario) {
      pipeline.push({
        $match: {
          $or: [
            { 'userObj.name': { $regex: filters.usuario, $options: 'i' } },
            { 'metadata.nombreProveedor': { $regex: filters.usuario, $options: 'i' } }
          ]
        }
      });
    }

    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await this.auditLogModel.db.collection('auditLogs').aggregate(countPipeline).toArray();
    const total = countResult[0]?.total || 0;

    pipeline.push({ $sort: { timestamp: -1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const logs = await this.auditLogModel.db.collection('auditLogs').aggregate(pipeline).toArray();

    const mappedLogs = logs.map(log => ({
      id: log._id.toString(),
      action: log.action,
      entity: log.entity,
      time: log.timestamp,
      metadata: log.metadata || {},
      user: {
        name: log.userObj?.name || 'Sistema / Usuario Eliminado',
        role: log.userObj?.role || 'Desconocido'
      }
    }));

    return {
      data: mappedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getLogs(limit = 100, skip = 0) {
    return this.auditLogModel
      .find()
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .populate('roleId', 'name')
      .exec();
  }
}