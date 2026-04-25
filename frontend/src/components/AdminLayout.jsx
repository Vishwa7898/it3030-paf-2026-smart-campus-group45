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
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-[73px] h-[calc(100vh-73px)]">
        <div className="p-6">
          <h2 className="text-sm font-black text-slate-600 uppercase tracking-widest mb-4">
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
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-inner'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
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
        <div className="mt-auto p-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-base font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-sm font-medium text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Nav (Horizontal Scroll) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 overflow-x-auto">
        <nav className="flex p-2 gap-2 w-max mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-slate-600'
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
