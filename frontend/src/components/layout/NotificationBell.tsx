"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Inbox, Loader2 } from 'lucide-react';
import { notificationsService, AppNotification } from '@/services/notificationsService';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';

export default function NotificationBell() {
  const router = useRouter();
  const { user } = useAuthStore(); 
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Justo ahora';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} hs`;
    return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
  };

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [notifsResponse, countResponse] = await Promise.all([
        notificationsService.getMyNotifications(),
        notificationsService.getUnreadCount()
      ]);

      const rawNotifs = notifsResponse as any;
      const validNotifs = Array.isArray(rawNotifs) 
        ? rawNotifs 
        : (rawNotifs?.data || rawNotifs?.notifications || []);
        
      setNotifications(validNotifs);

      const rawCount = countResponse as any;
      const validCount = typeof rawCount?.unread === 'number' 
        ? rawCount.unread 
        : (rawCount?.data?.unread || 0);
        
      setUnreadCount(validCount);

    } catch (error) {
      console.error("Error cargando notificaciones", error);
      setNotifications([]); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      try {
        await notificationsService.markAsRead(notification._id);
        setNotifications(prev => 
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("No se pudo marcar como leída", error);
      }
    }

    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marcando todas como leídas", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => {
          if (!isOpen) fetchNotifications();
          setIsOpen(!isOpen);
        }}
        className="relative p-2.5 rounded-full text-slate-500 hover:bg-slate-100 hover:text-brand-blue transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-salmon text-[10px] font-bold text-white border-2 border-white shadow-sm animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-brand-blue hover:text-brand-blue/80 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-brand-blue opacity-50" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Inbox className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-slate-50 transition-colors group relative",
                      !notif.isRead ? "bg-blue-50/30" : "bg-white"
                    )}
                  >
                    {!notif.isRead && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-blue rounded-r-full" />
                    )}
                    <div className="flex flex-col gap-1 pr-4">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={cn("text-sm font-bold", !notif.isRead ? "text-slate-900" : "text-slate-700")}>
                          {notif.title}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap pt-0.5">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>
                      <p className={cn("text-xs leading-relaxed line-clamp-2", !notif.isRead ? "text-slate-600 font-medium" : "text-slate-500")}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 border-t border-slate-50 bg-slate-50/50 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Centro de Alertas M2T
            </span>
          </div>

        </div>
      )}
    </div>
  );
}