import {api} from '../lib/api';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export const notificationsService = {
  getMyNotifications: async (): Promise<AppNotification[]> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<{ unread: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  }
};