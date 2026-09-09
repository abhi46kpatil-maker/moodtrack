import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, X, AlertTriangle, Info, Calendar } from 'lucide-react';

export function NotificationDrawer() {
  const { notifications, unreadCount, isOpen, setIsOpen, markAsRead, markAllAsRead } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              <p className="text-xs text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread update${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-1" />
              <p className="text-sm">No notifications right now.</p>
            </div>
          ) : (
            notifications.map(notif => {
              const isAlert = notif.type === 'high_stress_alert';
              return (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-colors ${
                    notif.is_read ? 'bg-white hover:bg-slate-50 opacity-75' : 'bg-indigo-50/40 hover:bg-indigo-50/70 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      isAlert ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'
                    }`}>
                      {isAlert ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs font-semibold text-slate-800 truncate">{notif.title}</h4>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
