import { useAuth } from '../context/AuthContext';
import { Shield, Users, BellRing, Ticket, Building2, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Users', value: '1,248', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20', link: '/admin/users' },
    { title: 'Active Tickets', value: '34', icon: Ticket, color: 'text-amber-400', bg: 'bg-amber-500/20', link: '/admin/tickets' },
    { title: 'Facilities', value: '156', icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', link: '/admin/facilities' },
    { title: 'Pending Bookings', value: '12', icon: CalendarCheck, color: 'text-purple-400', bg: 'bg-purple-500/20', link: '/admin/bookings' },
  ];

  return (
    <div className="fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Welcome back, {user?.name?.split(' ')[0] || 'Admin'}</h1>
          <p className="text-slate-400 mt-2">Here is what's happening across the campus today.</p>
        </div>
        <Link 
          to="/admin/notifications"
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
        >
          <BellRing size={18} />
          Broadcast Alert
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <Link key={i} to={s.link} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:bg-slate-800/80 transition-all hover:-translate-y-1 shadow-xl hover:shadow-2xl group backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">{s.title}</p>
                  <h3 className="text-3xl font-black text-white">{s.value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`${s.color}`} size={24} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions / Recent Activity Placeholder */}
      <div className="grid md:grid-cols-2 gap-8 mt-8">
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white">System Status</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl">
              <span className="font-bold text-slate-300">Database Connection</span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">ONLINE</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-2xl">
              <span className="font-bold text-slate-300">Authentication Service</span>
              <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">ONLINE</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
            <Ticket className="text-slate-400" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Recent Activity</h3>
          <p className="text-slate-400 text-sm">Activity feed will be available once ticketing and booking modules are fully integrated.</p>
        </div>
      </div>
    </div>
  );
}
