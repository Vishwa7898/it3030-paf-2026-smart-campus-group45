import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user, fetchJson } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  const fetchNotifications = async (silent = false) => {
    if (!user) {
      setNotifications([]);
      return;
    }
    
    if (!silent) setLoading(true);
    try {
      const data = await fetchJson('/api/notifications');
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch and polling setup
  useEffect(() => {
    fetchNotifications();

    // Poll every 30 seconds for new notifications if logged in
    let interval;
    if (user) {
      interval = setInterval(() => {
        fetchNotifications(true); // silent fetch (no loading spinner)
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const markRead = async (id) => {
    try {
      await fetchJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking as read', err);
    }
  };

  const markAllRead = async () => {
    try {
      await fetchJson('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markRead,
      markAllRead,
      refreshNotifications: () => fetchNotifications(false)
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
