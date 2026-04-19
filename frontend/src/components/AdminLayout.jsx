import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Ticket,
  CalendarCheck,
  BellRing,
  Users,
} from 'lucide-react';

const AdminLayout = () => {
  const { user } = useAuth();

  // Protect admin routes
  if (!user || !user.roles.includes('ADMIN')) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { name: 'Overview', path: '/admin', end: true, icon: LayoutDashboard },
    { name: 'Facilities', path: '/admin/facilities', icon: Building2 },
    { name: 'Tickets', path: '/admin/tickets', icon: Ticket },
    { name: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Notifications', path: '/admin/notifications', icon: BellRing },
    { name: 'Users', path: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex min-h-[calc(100vh-73px)] bg-[#0f172a]">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="p-6">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
            Admin Portal
          </h2>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                    }`
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        {/* Admin profile snippet at the bottom */}
        <div className="mt-auto p-6 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-slate-200 truncate">{user.name}</p>
              <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav (Horizontal Scroll) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 overflow-x-auto">
        <nav className="flex p-2 gap-2 w-max mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-3 rounded-xl text-[10px] font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600/10 text-indigo-400'
                      : 'text-slate-400'
                  }`
                }
              >
                <Icon size={20} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
