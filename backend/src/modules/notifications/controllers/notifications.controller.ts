import { Controller, Get, Patch, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'; 

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}
  private getUserId(req: any): string {
    const id = req.user?.id || req.user?.userId || req.user?.sub || req.user?._id;
    if (!id) {
      this.logger.error('No se pudo extraer el ID del usuario desde el token', req.user);
    }
    return id;
  }

  @Get()
  async getMyNotifications(@Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) return [];
    return this.notificationsService.getUserNotifications(userId);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const userId = this.getUserId(req);
    if (!userId) return { unread: 0 };
    return this.notificationsService.getUnreadCount(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, this.getUserId(req));
  }

  @Patch('read-all')
  async markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(this.getUserId(req));
  }
}