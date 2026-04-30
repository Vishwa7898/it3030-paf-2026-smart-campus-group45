import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Navigate } from 'react-router-dom';
import { Check, CheckCheck, Bell } from 'lucide-react';

export default function Notifications() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, markRead, markAllRead } = useNotifications();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="fade-in">
      <div className="card">
        <div className="card-header">
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0' }}>
              <Bell size={24} color="var(--primary)" className={unreadCount > 0 ? 'bell-ring' : ''} />
              Notifications
              {unreadCount > 0 && (
                <span className="badge" style={{ background: 'var(--danger)', color: 'white', marginLeft: '0.5rem' }}>
                  {unreadCount} New
                </span>
              )}
            </h2>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCheck size={18} /> Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem', width: '30px', height: '30px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            Loading notifications...
          </div>
        ) : (
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--surface)' }}>
                <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                <h3 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>You're all caught up!</h3>
                <p>There are no new notifications for you right now.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div 
                  key={item.id} 
                  className={`notification-item ${!item.read ? 'unread fade-in' : ''} ${item.actionUrl ? 'cursor-pointer hover:bg-slate-50 transition-colors' : ''}`}
                  onClick={(e) => {
                    // Prevent marking as read twice if clicking the check icon
                    if (e.target.closest('.mark-read-btn')) return;
                    
                    if (!item.read) markRead(item.id);
                    if (item.actionUrl) window.location.href = item.actionUrl;
                  }}
                >
                  <div className="notification-header">
                    <h3 className="notification-title group-hover:text-indigo-600 transition-colors">
                      {item.title}
                    </h3>
                    {!item.read && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          markRead(item.id);
                        }} 
                        className="btn-icon text-primary mark-read-btn" 
                        title="Mark as read"
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                  <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)' }}>{item.message}</p>
                  <div className="notification-meta">
                    <span className={`badge badge-${item.category.toLowerCase()}`}>{item.category}</span>
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
