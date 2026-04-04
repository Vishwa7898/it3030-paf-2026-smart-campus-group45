import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Settings,
  User,
  Bell,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isStudent } = useAuth();

  const navigation = useMemo(
    () => [
      {
        name: 'Ticket board',
        href: '/tickets',
        icon: LayoutDashboard,
        description: isStudent ? 'Your tickets only' : 'Every submission',
        match: (path) =>
          path === '/tickets' ||
          (path.startsWith('/tickets/') && path !== '/tickets/new'),
      },
      {
        name: 'Report issue',
        href: '/tickets/new',
        icon: PlusCircle,
        description: 'Create ticket',
        match: (path) => path === '/tickets/new',
      },
    ],
    [isStudent]
  );

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
      {/* Sidebar — rich gradient, friendly contrast */}
      <aside className="w-64 shrink-0 flex flex-col z-20 shadow-xl shadow-indigo-900/25">
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-950 via-violet-900 to-purple-950 text-white border-r border-white/10">
          <div className="p-5 pb-4 border-b border-white/10">
            <Link to="/tickets" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-orange-500/40 ring-2 ring-white/20 group-hover:scale-105 transition-transform duration-200">
                  S
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-indigo-950" />
              </div>
              <div>
                <p className="font-bold text-lg tracking-tight leading-tight bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                  SmartCampus
                </p>
                <p className="text-[11px] text-indigo-200/90 font-medium flex items-center gap-1 mt-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Operations hub
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-3 py-5 space-y-1.5" aria-label="Main">
            {navigation.map((item) => {
              const active = item.match(location.pathname);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`group flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-amber-400/80 focus-visible:ring-offset-2 focus-visible:ring-offset-violet-900 ${
                    active
                      ? 'bg-white/15 text-white shadow-inner ring-1 ring-white/25 backdrop-blur-sm'
                      : 'text-indigo-100/90 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span
                    className={`flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors ${
                      active
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-500/30'
                        : 'bg-white/10 text-indigo-100 group-hover:bg-white/15'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </span>
                  <span className="flex flex-col items-start min-w-0">
                    <span className="font-semibold text-sm leading-tight">{item.name}</span>
                    <span
                      className={`text-[11px] leading-tight mt-0.5 ${
                        active ? 'text-indigo-100' : 'text-indigo-200/70'
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                </Link>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/10">
              <span
                className="flex items-center gap-3 px-3.5 py-3 rounded-2xl text-indigo-200/60 cursor-not-allowed"
                title="Coming soon"
              >
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5">
                  <Settings className="w-5 h-5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-sm text-indigo-100/50">Settings</span>
                  <span className="text-[11px]">Soon</span>
                </span>
              </span>
            </div>
          </nav>

          <div className="p-4 mx-3 mb-4 rounded-2xl bg-gradient-to-br from-white/12 to-white/5 border border-white/10 backdrop-blur-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg ring-2 ring-white/20">
                <User className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-white truncate">
                  {user?.displayName ?? user?.id}
                </p>
                <p className="text-xs text-indigo-200/80 font-medium">{user?.role}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white/90 bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Log out
            </button>
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0 relative z-10">
        <header className="sticky top-0 z-30 shrink-0">
          <div className="mx-4 mt-4 mb-0 rounded-2xl border border-white/60 bg-white/75 backdrop-blur-xl shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-100/50">
            <div className="h-[4px] rounded-t-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-amber-400" />
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
                  {pageTitle()}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                  Facility &amp; asset incident tracking for your campus
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  className="relative p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  aria-label="Notifications (demo)"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
                </button>
                <Link
                  to="/tickets/new"
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <Ticket className="w-4 h-4" />
                  New ticket
                </Link>
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
