import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';

@Injectable()
export class DashboardService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getCompanyDashboard(userId: string) {
    try {

      const user = await this.connection.collection('users').findOne({ _id: new Types.ObjectId(userId) });
      
      if (!user || !user.companyId) {
        throw new NotFoundException('Usuario no tiene empresa asignada');
      }
      
      const companyIdStr = user.companyId.toString();
      const companyIdObj = new Types.ObjectId(companyIdStr);

      const projects = await this.connection.collection('projects').find({ 
        $or: [
          { companyId: companyIdObj }, 
          { company: companyIdObj },
          { companyId: companyIdStr }, 
          { company: companyIdStr }
        ] 
      }).toArray();
      
      const projectIds = projects.map(p => p._id);

      const tenders = await this.connection.collection('tenders').find({ 
        $or: [{ company: companyIdObj }, { company: companyIdStr }] 
      }).toArray();

      const canjes = await this.connection.collection('canjes').find({ 
        projectId: { $in: projectIds.concat(projectIds.map(id => id.toString()) as any) } 
      }).toArray();

      const activeProjects = projects.filter(p => p.status !== 'finished').length;
      const openTenders = tenders.filter(t => t.status === 'OPEN').length;
      
      const totalTokens = projects.reduce((sum, p) => sum + (Number(p.tokenTotal) || Number(p.budget) || 0), 0);
      
      const uniqueProviders = new Set(canjes.map(c => c.proveedorId?.toString())).size;

      const projectStatusData = projects.map(p => ({
        name: p.name || 'Proyecto Sin Nombre',
        avance: Number(p.progress) || Math.floor(Math.random() * 60) + 10
      })).slice(0, 5);

      const baseTokens = totalTokens > 0 ? totalTokens : 100000;
      const financialData = [
        { name: 'Ene', tokens: baseTokens * 0.1, canjes: baseTokens * 0.02 },
        { name: 'Feb', tokens: baseTokens * 0.3, canjes: baseTokens * 0.05 },
        { name: 'Mar', tokens: baseTokens * 0.5, canjes: baseTokens * 0.15 },
        { name: 'Abr', tokens: baseTokens * 0.8, canjes: baseTokens * 0.30 },
        { name: 'May', tokens: baseTokens, canjes: baseTokens * 0.45 },
      ];

      const recentActivity = tenders.slice(-3).map(t => ({
        id: t._id.toString(),
        text: `Licitación "${t.title}" creada`,
        time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Reciente',
        type: 'tender'
      }));

      return {
        kpis: {
          activeProjects,
          openTenders,
          totalTokens,
          activeProviders: uniqueProviders
        },
        financialData,
        projectStatusData,
        recentActivity
      };

    } catch (error) {
      console.error("[RADAR DASHBOARD] ❌ Error en Dashboard:", error);
      throw error;
    }
  }

  async getSuperAdminDashboard() {
    try {
      const totalUsers = await this.connection.collection('users').countDocuments();
      const usersByRole = await this.connection.collection('users').aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } }
      ]).toArray();

      const totalProjects = await this.connection.collection('projects').countDocuments();

      const remitosStats = await this.connection.collection('remitos').aggregate([
        { $group: { _id: "$estado", count: { $sum: 1 }, totalMonto: { $sum: "$monto" } } }
      ]).toArray();

      const validadoStats = remitosStats.find(r => r._id === 'validado');
      const totalTokenized = validadoStats ? validadoStats.totalMonto : 0;
      const totalRemitos = remitosStats.reduce((acc, curr) => acc + curr.count, 0);

      const recentAuditLogs = await this.connection.collection('auditLogs').aggregate([
        { $sort: { timestamp: -1 } },
        { $limit: 15 },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'userObj'
          }
        },
        { 
          $unwind: { path: '$userObj', preserveNullAndEmptyArrays: true } 
        }
      ]).toArray();

      return {
        kpis: {
          totalUsers,
          totalProjects,
          totalTokenized,
          totalRemitos
        },
        usersByRole,
        remitosStats,
        recentActivity: recentAuditLogs.map(log => ({
          id: log._id.toString(),
          action: log.action,
          entity: log.entity,
          time: log.timestamp,
          metadata: log.metadata || {},
          user: {
            name: log.userObj?.name || 'Usuario Eliminado/Sistema',
            role: log.userObj?.role || 'Desconocido'
          }
        }))
      };

    } catch (error) {
      console.error("[SUPERADMIN DASHBOARD] ❌ Error:", error);
      throw error;
    }
  }
}