import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Bell, CircleDot, Clock3, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api.js';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socketConnected, setSocketConnected] = useState(false);
  const panelRef = useRef(null);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load notifications');
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || window.location.origin;
    const token = api.defaults.headers.common.Authorization?.split(' ')[1];
    const socket = io(socketUrl, { auth: { token } });

    socket.on('connect', () => setSocketConnected(true));
    socket.on('disconnect', () => setSocketConnected(false));
    socket.on('notification', (notification) => {
      setNotifications((current) => [{ ...notification, read: notification.read || false }, ...current].slice(0, 20));
      toast(notification.message || notification.title || 'New notification');
    });
    socket.emit('joinAdmin');

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const unread = notifications.filter((item) => !item.read);
    if (!unread.length) return;

    setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    try {
      await Promise.all(
        unread
          .filter((item) => item._id)
          .map((item) => api.patch(`/notifications/${item._id}/read`))
      );
    } catch (err) {
      console.warn('Unable to mark all notifications read', err);
    }
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await markAllAsRead();
  };

  const formatTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1.5 text-[11px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-1rem))] rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{socketConnected ? 'Live updates enabled' : 'Connecting...'}</p>
            </div>
            <button type="button" onClick={markAllAsRead} className="text-xs font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300">Mark all read</button>
          </div>
          <div className="max-h-[28rem] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Loading notifications...</div>
            ) : error ? (
              <div className="p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-600 dark:text-slate-300">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id || `${notification.title}-${notification.createdAt}`}
                  className={`border-b border-slate-200 px-4 py-4 last:border-none dark:border-slate-800 ${notification.read ? 'bg-slate-50 dark:bg-slate-900' : 'bg-slate-100 dark:bg-slate-950'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{notification.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{notification.message}</p>
                    </div>
                    {!notification.read && <CircleDot className="mt-1 h-3 w-3 text-rose-500" />}
                  </div>
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{formatTime(notification.createdAt)}</p>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            <span>{notifications.length} total</span>
            <button type="button" onClick={() => setOpen(false)} className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
              Close <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
