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

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <BellRing size={32} />
          </div>
          <h3>Real-time Notifications</h3>
          <p>Stay updated with instant alerts on your bookings, tickets, and important campus announcements.</p>
        </div>
        
        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <ShieldCheck size={32} />
          </div>
          <h3>Secure Authorization</h3>
          <p>Role-based access control ensuring that your data remains safe and accessible only to authorized personnel.</p>
        </div>

        <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary-light)', padding: '1rem', borderRadius: '50%', color: 'var(--primary)', marginBottom: '1rem' }}>
            <Users size={32} />
          </div>
          <h3>Collaborative Platform</h3>
          <p>Built for students, staff, and admins to interact smoothly within a single unified dashboard.</p>
        </div>
      </section>
    </div>
  );
}
