import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Send, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const { user, fetchJson } = useAuth();
  const [draft, setDraft] = useState({
    recipientEmail: '',
    title: '',
    message: '',
    category: 'BOOKING',
  });
  const [status, setStatus] = useState({ type: '', message: '' });

  // Security check: only ADMIN can access
  if (!user || !user.roles.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  async function sendAdminNotification(event) {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Sending notification...' });
    
    try {
      await fetchJson('/api/notifications', {
        method: 'POST',
        body: JSON.stringify(draft),
      });
      
      setStatus({ type: 'success', message: 'Notification sent successfully!' });
      setDraft({
        recipientEmail: '',
        title: '',
        message: '',
        category: 'BOOKING',
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setStatus({ type: 'error', message: 'Failed to send notification. Please try again.' });
    }
  }

  return (
    <div className="fade-in">
      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0' }}>
            <ShieldAlert size={24} color="var(--danger)" />
            Admin: Broadcast Notification
          </h2>
        </div>

        {status.message && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            borderRadius: 'var(--radius-md)',
            background: status.type === 'success' ? 'var(--success)' : status.type === 'error' ? 'var(--danger)' : 'var(--primary-light)',
            color: status.type === 'loading' ? 'var(--primary)' : 'white',
            fontWeight: '600'
          }}>
            {status.message}
          </div>
        )}

        <form onSubmit={sendAdminNotification}>
          <div className="form-group">
            <label className="form-label">Recipient Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="user@example.com (or leave empty for broadcast if supported)"
              value={draft.recipientEmail}
              onChange={(e) => setDraft({ ...draft, recipientEmail: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Notification Title</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Campus Maintenance Alert"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="input-field"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
              required
            >
              <option value="BOOKING">Booking Update</option>
              <option value="TICKET">Ticket Update</option>
              <option value="COMMENT">New Comment</option>
              <option value="SYSTEM">System Alert</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Message Content</label>
            <textarea
              className="input-field"
              placeholder="Enter the details of the notification..."
              value={draft.message}
              onChange={(e) => setDraft({ ...draft, message: e.target.value })}
              rows={5}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ width: '100%', padding: '1rem' }}
            disabled={status.type === 'loading'}
          >
            <Send size={18} /> {status.type === 'loading' ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
}
