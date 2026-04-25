import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, BellRing, Users } from 'lucide-react';
import image4 from '../assets/image4.jpg';
import studentDining from '../assets/student_dining.jpg';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="fade-in">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Smart Campus</h1>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1.25rem',
            width: '100%',
            maxWidth: '860px',
            margin: '1.5rem auto 1rem',
          }}
        >
          <img
            src={image4}
            alt="Smart campus environment"
            className="w-full h-56 object-cover rounded-3xl shadow-xl border border-slate-700/40"
          />
          <img
            src={studentDining}
            alt="Students in dining area"
            className="w-full h-56 object-cover rounded-3xl shadow-xl border border-slate-700/40"
          />
        </div>
        <p className="hero-subtitle" style={{ fontSize: '28px' }}>
          "Revolutionizing campus management with intelligent automation and seamless user experiences."
        </p>
        

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
      <footer
  style={{
    marginTop: '3rem',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '2rem 1rem',
    borderTop: '1px solid #1e293b',
  }}
>
  <div
    style={{
      maxWidth: '1100px',
      margin: 'auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
    }}
  >
    {/* About */}
    <div>
      <h3 style={{ marginBottom: '0.5rem' }}>Smart Campus</h3>
      <p style={{ fontSize: '19px', lineHeight: '1.5' }}>
        A modern campus management system designed to simplify student, staff, and admin operations.
      </p>
    </div>

    {/* Contact */}
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Contact Us</h3>
      <p>Email: smartcampus@gmail.com</p>
      <p>Phone: +94 77 123 4567</p>
    </div>

    {/* Location */}
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Location</h3>
      <p>SLIIT,Campus</p>
      <p>Malabe,</p>
      <p>Kaduwela Road, Sri Lanka</p>
    </div>
  </div>

  {/* Bottom line */}
  <div
    style={{
      textAlign: 'center',
      marginTop: '1.5rem',
      fontSize: '13px',
      color: '#5f7594',
    }}
  >
    
  </div>
</footer>
    </div>
  );
}
