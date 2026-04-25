import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, BellRing, Users } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Smart Campus</h1>
        <p className="hero-subtitle">
          Experience a unified, modern, and intelligent campus management system designed for seamless connectivity.
        </p>
        
        {!user ? (
          <Link to="/login" className="btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.125rem' }}>
            Get Started <ArrowRight size={20} />
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/notifications" className="btn-primary">
              View Notifications
            </Link>
            {user.roles.includes('ADMIN') && (
              <Link to="/admin" className="btn-secondary">
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
          marginTop: '2rem',
        }}
      >
        <div
          className="text-center rounded-3xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ background: '#dbeafe', padding: '1rem', borderRadius: '50%', color: '#1d4ed8', marginBottom: '1rem' }}>
            <BellRing size={32} />
          </div>
          <h3 className="text-slate-900 text-2xl font-bold mb-3">Real-time Notifications</h3>
          <p className="text-slate-700 text-base leading-relaxed">
            Stay updated with instant alerts on your bookings, tickets, and important campus announcements.
          </p>
        </div>
        
        <div
          className="text-center rounded-3xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '50%', color: '#15803d', marginBottom: '1rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-slate-900 text-2xl font-bold mb-3">Secure Authorization</h3>
          <p className="text-slate-700 text-base leading-relaxed">
            Role-based access control ensuring that your data remains safe and accessible only to authorized personnel.
          </p>
        </div>

        <div
          className="text-center rounded-3xl p-8 shadow-lg transition-transform duration-300 hover:-translate-y-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#fff7ed',
            border: '1px solid #fed7aa',
          }}
        >
          <div style={{ background: '#ffedd5', padding: '1rem', borderRadius: '50%', color: '#c2410c', marginBottom: '1rem' }}>
            <Users size={32} />
          </div>
          <h3 className="text-slate-900 text-2xl font-bold mb-3">Collaborative Platform</h3>
          <p className="text-slate-700 text-base leading-relaxed">
            Built for students, staff, and admins to interact smoothly within a single unified dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
