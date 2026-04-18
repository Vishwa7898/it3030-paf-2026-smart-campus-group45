import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, User, LogOut, Home, Settings, Menu, Shield } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="app-container">
      <nav className="navbar glass-panel">
        <div className="nav-brand">
          <Link to="/" className="brand-link">
            <div className="brand-logo">SC</div>
            <span className="brand-text">Smart Campus</span>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="nav-links desktop-only">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Home size={18} /> Home
          </Link>
          
          {/* Team Members can add their routes here like:
             <Link to="/food" className="nav-link">Food</Link>
          */}

          {user && (
            <>
              <Link to="/notifications" className={`nav-link ${isActive('/notifications') ? 'active' : ''}`} style={{ position: 'relative' }}>
                <Bell size={18} className={unreadCount > 0 ? 'bell-ring' : ''} />
                Notifications
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </Link>
              {user.roles.includes('ADMIN') && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                  <Shield size={18} /> Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="nav-actions desktop-only">
          {!user ? (
            <Link to="/login" className="btn-primary">
              <User size={18} /> Sign In
            </Link>
          ) : (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <span className="user-role">{user.roles[0]}</span>
              </div>
              <button onClick={logout} className="btn-icon" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass-panel fade-in">
          <Link to="/" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          
          {user && (
            <>
              <Link to="/notifications" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Notifications</Link>
              {user.roles.includes('ADMIN') && (
                <Link to="/admin" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Admin Dashboard</Link>
              )}
            </>
          )}
          
          <div className="mobile-divider"></div>
          
          {!user ? (
            <Link to="/login" className="mobile-link text-primary" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
          ) : (
            <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="mobile-link text-danger">
              Logout
            </button>
          )}
        </div>
      )}

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Smart Campus Group 45. All rights reserved.</p>
      </footer>
    </div>
  );
}
