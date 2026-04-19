import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { Bell, LogOut, Home, Ticket, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = () => {
    if (location.pathname === '/') return 'Campus Dashboard';
    if (location.pathname === '/tickets/new') return 'Report a New Issue';
    if (location.pathname.startsWith('/facilities')) return 'Facilities Catalogue';
    if (location.pathname === '/notifications') return 'Your Notifications';
    return 'Smart Campus';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 shrink-0 p-4">
        <div className="mx-auto max-w-7xl rounded-3xl border border-indigo-200/20 bg-slate-900/80 backdrop-blur-md shadow-xl overflow-hidden">
          <div className="h-[4px] bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />
          
          <div className="flex items-center justify-between px-8 py-6">
            {/* Brand & Title */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="bg-indigo-600 p-2.5 rounded-xl group-hover:bg-indigo-500 transition-colors">
                  <Home className="text-white" size={28} />
                </div>
                <h1 className="text-3xl font-extrabold text-white hidden sm:block">SmartCampus</h1>
              </Link>
              <div className="h-8 w-[1px] bg-slate-700 hidden md:block" />
              <h2 className="text-xl font-semibold text-indigo-300 truncate max-w-[200px] sm:max-w-none">
                {pageTitle()}
              </h2>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-3">
              <Link to="/facilities" className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${isActive('/facilities') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                Facilities
              </Link>
              <Link to="/tickets" className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${isActive('/tickets') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                Tickets
              </Link>
              {isAdmin && (
                <Link to="/admin" className={`px-5 py-2.5 rounded-xl text-base font-medium transition-all ${isActive('/admin') ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800'}`}>
                  Admin
                </Link>
              )}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notification Bell */}
              <Link to="/notifications" className="relative p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <Bell size={24} className={unreadCount > 0 ? 'animate-bounce text-amber-400' : ''} />
                {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-900" />
                )}
              </Link>

              {/* User Info & Logout (Desktop) */}
              <div className="hidden sm:flex items-center gap-4 pl-4 border-l border-slate-700">
                <div className="text-right">
                  <p className="text-base font-bold text-white leading-none">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider mt-1.5">
                    {user?.roles?.[0] || 'Member'}
                  </p>
                </div>
                <button onClick={handleLogout} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                  <LogOut size={24} />
                </button>
              </div>

              {/* Mobile Menu Toggle */}
              <button className="lg:hidden p-2 rounded-xl bg-slate-800" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-2xl animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-2">
              <Link to="/facilities" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-xl bg-slate-800 text-center font-medium">Facilities</Link>
              <Link to="/tickets" onClick={() => setIsMobileMenuOpen(false)} className="p-3 rounded-xl bg-slate-800 text-center font-medium">Tickets</Link>
              {user && (
                <Link to="/tickets/new" onClick={() => setIsMobileMenuOpen(false)} className="col-span-2 p-3 rounded-xl bg-indigo-600 text-center font-bold text-white flex items-center justify-center gap-2">
                  <Ticket size={18} /> New Ticket
                </Link>
              )}
              <button onClick={handleLogout} className="col-span-2 p-3 rounded-xl bg-rose-500/20 text-rose-500 font-bold">Logout</button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="mt-auto p-8 border-t border-slate-800 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Smart Campus Group 45. All rights reserved.</p>
      </footer>
    </div>
  );
}