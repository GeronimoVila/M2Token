import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification, NotificationDocument } from '../models/notification.model';
import { IUser } from '../../users/models/user.model'; 
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel('users') private userModel: Model<IUser>,
  ) {}

  async getUserNotifications(userId: string) {
    if (!userId) return [];
    return this.notificationModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(50).exec();
  }

  async getUnreadCount(userId: string) {
    if (!userId) return { unread: 0 };
    const count = await this.notificationModel.countDocuments({ userId: new Types.ObjectId(userId), isRead: false });
    return { unread: count };
  }

  async markAsRead(notificationId: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: new Types.ObjectId(notificationId), userId: new Types.ObjectId(userId) },
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany(
      { userId: new Types.ObjectId(userId), isRead: false },
      { isRead: true }
    );
  }

  @OnEvent('tender.published')
  async handleTenderPublished(payload: { categoryId: string, projectName: string, tenderId: string }) {
    const providers = await this.userModel.find({ role: 'proveedor', category: new Types.ObjectId(payload.categoryId), isActive: true });
    
    const notifications = providers.map(p => ({
      userId: p._id,
      type: 'TENDER_PUBLISHED',
      title: 'Nueva Licitación Disponible',
      message: `Se ha publicado una nueva licitación en el proyecto ${payload.projectName} que coincide con tu rubro.`,
      link: `/proveedor/tenders/${payload.tenderId}`
    }));
    if (notifications.length > 0) await this.notificationModel.insertMany(notifications);
  }

  @OnEvent('bid.awarded')
  async handleBidAwarded(payload: { providerId: string, projectName: string, projectId: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'BID_AWARDED',
      title: '¡Licitación Adjudicada! 🎉',
      message: `Felicidades, tu oferta ha sido seleccionada para el proyecto ${payload.projectName}.`,
      link: `/proveedor/projects/${payload.projectId}`
    });
  }

  @OnEvent('bid.rejected')
  async handleBidRejected(payload: { providerId: string, projectName: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'BID_REJECTED',
      title: 'Oferta no seleccionada',
      message: `Tu propuesta para el proyecto ${payload.projectName} no fue seleccionada en esta ocasión.`,
      link: `/proveedor/tenders`
    });
  }

  @OnEvent('remito.validated')
  async handleRemitoValidated(payload: { providerId: string, numeroRemito: string, projectId: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'REMITO_VALIDATED',
      title: 'Remito Aprobado ✅',
      message: `Tu remito #${payload.numeroRemito} ha sido validado y los tokens han sido emitidos a tu favor.`,
      link: `/proveedor/projects/${payload.projectId}`
    });
  }

  @OnEvent('remito.rejected')
  async handleRemitoRejected(payload: { providerId: string, numeroRemito: string, projectId: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'REMITO_REJECTED',
      title: 'Remito Rechazado ❌',
      message: `Tu remito #${payload.numeroRemito} ha sido rechazado. Contacta a la empresa para más detalles.`,
      link: `/proveedor/projects/${payload.projectId}`
    });
  }

  @OnEvent('project.assigned')
  async handleProjectAssigned(payload: { providerId: string, projectName: string, projectId: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'PROJECT_ASSIGNED',
      title: 'Nuevo Proyecto Asignado',
      message: `Has sido asignado a la obra: ${payload.projectName}. Ya puedes cargar remitos.`,
      link: `/proveedor/projects/${payload.projectId}`
    });
  }

  @OnEvent('bid.received')
  async handleBidReceived(payload: { companyId: string, providerName: string, projectName: string, tenderId: string, projectId: string }) {
    const admins = await this.userModel.find({ companyId: new Types.ObjectId(payload.companyId), role: { $in: ['empresa_owner', 'empresa_admin'] as any[] }, isActive: true });
    
    const notifications = admins.map(a => ({
      userId: a._id,
      type: 'BID_RECEIVED',
      title: 'Nueva Oferta Recibida',
      message: `${payload.providerName} ha enviado una propuesta para el proyecto ${payload.projectName}.`,
      link: `/companies/projects/${payload.projectId}/tenders/${payload.tenderId}`
    }));
    if (notifications.length > 0) await this.notificationModel.insertMany(notifications);
  }

  @OnEvent('remito.submitted')
  async handleRemitoSubmitted(payload: { companyId: string, providerName: string, numeroRemito: string, projectId: string }) {
    const admins = await this.userModel.find({ companyId: new Types.ObjectId(payload.companyId), role: { $in: ['empresa_owner', 'empresa_admin'] as any[] }, isActive: true });
    
    const notifications = admins.map(a => ({
      userId: a._id,
      type: 'REMITO_SUBMITTED',
      title: 'Nuevo Remito para Revisión',
      message: `${payload.providerName} ha cargado el remito #${payload.numeroRemito} en tu proyecto.`,
      link: `/companies/projects/${payload.projectId}`
    }));
    if (notifications.length > 0) await this.notificationModel.insertMany(notifications);
  }

  @OnEvent('canje.requested')
  async handleCanjeRequested(payload: { companyId: string, providerName: string, amount: number, tipo: string, projectId: string }) {
    const admins = await this.userModel.find({ companyId: new Types.ObjectId(payload.companyId), role: { $in: ['empresa_owner', 'empresa_admin'] as any[] }, isActive: true });
    
    const notifications = admins.map(a => ({
      userId: a._id,
      type: 'CANJE_REQUESTED',
      title: 'Solicitud de Retiro',
      message: `${payload.providerName} ha solicitado retirar ${payload.amount} M2T (${payload.tipo}).`,
      link: `/companies/projects/${payload.projectId}/canjes`
    }));
    if (notifications.length > 0) await this.notificationModel.insertMany(notifications);
  }

  @OnEvent('company.registered')
  async handleCompanyRegistered(payload: { companyName: string }) {
    const superAdmins = await this.userModel.find({ role: 'superadmin', isActive: true });
    if (!superAdmins.length) return;
    
    const notifications = superAdmins.map(sa => ({
      userId: sa._id,
      type: 'COMPANY_REGISTERED',
      title: 'Nueva Empresa Registrada',
      message: `La empresa ${payload.companyName} se ha registrado en la plataforma.`,
      link: `/admin/users`
    }));
    if (notifications.length > 0) await this.notificationModel.insertMany(notifications);
  }

  @OnEvent('canje.completed')
  async handleCanjeCompleted(payload: { providerId: string, amount: number, tipo: string }) {
    await this.notificationModel.create({
      userId: new Types.ObjectId(payload.providerId),
      type: 'CANJE_COMPLETED',
      title: 'Retiro Completado 💵',
      message: `Tu solicitud de retiro por ${payload.amount} M2T (${payload.tipo}) ha sido procesada con éxito.`,
      link: `/proveedor/canjes`
    });
  }
}