'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Bell,
  Check,
  CheckCheck,
  X,
  CalendarDays,
  Shield,
  UserCheck,
  Info,
  Loader2,
} from 'lucide-react';
import { Notification, NotificationType } from '@/types';
import { 
  subscribeToUserNotifications,
  subscribeToUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/lib/firebase/notifications';
import { formatDistanceToNow } from 'date-fns';

interface NotificationBellProps {
  userId: string;
}

const notificationIcons: Record<NotificationType, typeof Bell> = {
  leave_request: CalendarDays,
  leave_approved: Check,
  leave_rejected: X,
  permission_updated: Shield,
  approver_updated: UserCheck,
  general: Info,
};

const notificationColors: Record<NotificationType, string> = {
  leave_request: 'bg-blue-100 text-blue-600',
  leave_approved: 'bg-green-100 text-green-600',
  leave_rejected: 'bg-red-100 text-red-600',
  permission_updated: 'bg-purple-100 text-purple-600',
  approver_updated: 'bg-amber-100 text-amber-600',
  general: 'bg-slate-100 text-slate-600',
};

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubNotifications = subscribeToUserNotifications(userId, (data) => {
      setNotifications(data);
      setLoading(false);
    });

    const unsubCount = subscribeToUnreadCount(userId, (count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubNotifications();
      unsubCount();
    };
  }, [userId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(userId);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <h3 className="font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map(notification => {
                  const Icon = notificationIcons[notification.type] || Bell;
                  const colorClass = notificationColors[notification.type] || notificationColors.general;

                  return (
                    <div
                      key={notification.id}
                      onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                      className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notification.isRead ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex items-center justify-center h-9 w-9 rounded-lg shrink-0 ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                              {notification.title}
                            </p>
                            {!notification.isRead && (
                              <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1">
                            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
