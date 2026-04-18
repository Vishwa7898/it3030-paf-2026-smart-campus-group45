import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Check, CheckCheck, Bell } from 'lucide-react';

export default function Notifications() {
  const { user, fetchJson } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications]
  );

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  async function loadNotifications() {
    setLoadingData(true);
    try {
      const data = await fetchJson('/api/notifications');
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoadingData(false);
    }
  }

  async function markRead(id) {
    try {
      await fetchJson(`/api/notifications/${id}/read`, { method: 'PATCH' });
      await loadNotifications();
    } catch (err) {
      console.error('Error marking as read', err);
    }
  }

  async function markAllRead() {
    try {
      await fetchJson('/api/notifications/read-all', { method: 'PATCH' });
      await loadNotifications();
    } catch (err) {
      console.error('Error marking all as read', err);
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0' }}>
              <Bell size={24} color="var(--primary)" />
              Notifications
              {unreadCount > 0 && (
                <span style={{ 
                  background: 'var(--danger)', color: 'white', fontSize: '0.875rem', 
                  padding: '2px 8px', borderRadius: 'var(--radius-full)', marginLeft: '0.5rem' 
                }}>
                  {unreadCount} New
                </span>
              )}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary">
              <CheckCheck size={18} /> Mark all read
            </button>
          )}
        </div>

        {error && <p className="text-danger" style={{ marginBottom: '1rem' }}>{error}</p>}

        {loadingData ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading notifications...
          </div>
        ) : (
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>You're all caught up! No notifications yet.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div key={item.id} className={`notification-item ${!item.read ? 'unread' : ''}`}>
                  <div className="notification-header">
                    <h3 className="notification-title">{item.title}</h3>
                    {!item.read && (
                      <button 
                        onClick={() => markRead(item.id)} 
                        className="btn-icon text-primary" 
                        title="Mark as read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0.5rem 0' }}>{item.message}</p>
                  <div className="notification-meta">
                    <span className={`badge ${item.category}`}>{item.category}</span>
                    <span>{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
