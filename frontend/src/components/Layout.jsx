import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ticket, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const pageTitle = () => {
    if (location.pathname === '/tickets/new') return 'Report a new issue';
    if (location.pathname.startsWith('/tickets/') && location.pathname !== '/tickets/new') {
      return 'Ticket details';
    }
    return 'Maintenance & incidents';
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        <header className="sticky top-0 z-30 shrink-0">
          <div className="mx-4 mt-4 mb-0 rounded-3xl border border-indigo-200/70 bg-gradient-to-r from-indigo-700 via-violet-700 to-fuchsia-700 shadow-xl shadow-indigo-500/25 ring-2 ring-indigo-200/60 overflow-hidden">
            <div className="h-[6px] rounded-t-3xl bg-gradient-to-r from-amber-300 via-cyan-300 to-emerald-300" />
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 sm:px-6 py-5 sm:py-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {pageTitle()}
                </h1>
                <p className="text-sm sm:text-base text-indigo-100/95 mt-1">
                  Facility &amp; asset incident tracking for your campus
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to="/tickets"
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === '/tickets'
                        ? 'bg-white text-indigo-700'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Tickets
                  </Link>
                  <Link
                    to="/tickets/new"
                    className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === '/tickets/new'
                        ? 'bg-amber-300 text-slate-900'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Report Issue
                  </Link>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                <button
                  type="button"
                  className="relative p-3 rounded-2xl text-white bg-white/15 hover:bg-white/25 transition-colors"
                  aria-label="Notifications (demo)"
                >
                  <Bell className="w-6 h-6" />
                  <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-400 ring-2 ring-violet-700" />
                </button>
                <Link
                  to="/tickets/new"
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl text-sm sm:text-base font-bold text-slate-900 bg-gradient-to-r from-amber-300 to-yellow-300 hover:from-amber-200 hover:to-yellow-200 shadow-md shadow-amber-300/40 transition-all"
                >
                  <Ticket className="w-5 h-5" />
                  New ticket
                </Link>
                <div className="flex items-center gap-2 text-sm text-white bg-white/15 rounded-2xl px-3 py-2.5 border border-white/20">
                  <span className="font-semibold truncate max-w-32">{user?.displayName ?? user?.id}</span>
                  <span className="text-indigo-200">|</span>
                  <span className="font-semibold">{user?.role}</span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-semibold text-white bg-rose-500/85 border border-rose-300/40 hover:bg-rose-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto relative app-bg-mesh">
          <div className="relative z-[1] p-4 sm:p-6 lg:p-8 min-h-full">
            <div className="max-w-6xl mx-auto">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
