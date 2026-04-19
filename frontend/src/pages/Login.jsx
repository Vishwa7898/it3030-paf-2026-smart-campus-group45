import { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { KeyRound, GraduationCap, Shield, Wrench, Sparkles } from 'lucide-react';

// Demo card විස්තර
const demoRoles = [
  {
    role: 'STUDENT',
    title: 'Student Access',
    subtitle: 'Submit tickets and track your own facility reports.',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400/40',
  },
  {
    role: 'ADMIN',
    title: 'Admin Access',
    subtitle: 'Manage all tickets, assign technicians, and control workflow.',
    icon: Shield,
    gradient: 'from-violet-600 to-indigo-700',
    ring: 'ring-violet-400/40',
  },
  {
    role: 'TECHNICIAN',
    title: 'Technician Access',
    subtitle: 'Update status and resolve tickets assigned specifically to you.',
    icon: Wrench,
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-400/40',
  },
];

export default function Login() {
  const { user, login, isAdmin } = useAuth();
  const navigate = useNavigate();

  // දැනටමත් login වී ඇත්නම් අදාළ තැනට යොමු කරන්න
  if (user) {
    return <Navigate to={isAdmin ? "/admin" : "/facilities"} replace />;
  }

  return (
    <div className="min-h-screen app-bg-mesh flex flex-col items-center justify-center p-6 relative">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-400/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-cyan-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl text-center">
        {/* Header Section */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-300 text-sm font-medium shadow-sm mb-4 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Module C — Maintenance & Incident Ticketing
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            SmartCampus <span className="text-indigo-500">Portal</span>
          </h1>
          <p className="mt-4 text-slate-400 max-w-xl mx-auto text-base">
            Everything you need for campus life in one place. Please sign in to access facility management and ticketing.
          </p>
        </div>

        {/* Google Login Section (Main Logic) */}
        <div className="mb-12 flex justify-center">
          <button 
            onClick={login} 
            className="group relative flex items-center gap-4 bg-white hover:bg-slate-100 text-slate-900 font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-2xl shadow-indigo-500/20 hover:scale-105 active:scale-95"
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
              alt="Google Logo" 
              className="w-6 h-6"
            />
            Sign in with Student ID (Google)
          </button>
        </div>

        {/* Demo Roles Info (UI Only - To show capabilities) */}
        <div className="grid sm:grid-cols-3 gap-5">
          {demoRoles.map(({ role, title, subtitle, icon: Icon, gradient, ring }) => (
            <div
              key={role}
              className={`text-left rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 shadow-xl transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-lg text-white">{title}</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">{subtitle}</p>
              <div className="mt-4 inline-block text-[10px] font-mono text-indigo-400 border border-indigo-400/30 px-2 py-0.5 rounded">
                ROLE: {role}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-xs text-slate-500 max-w-md mx-auto">
          Secure authentication powered by Smart Campus Identity. By signing in, you agree to our 
          <span className="text-indigo-400 hover:underline cursor-pointer"> Terms & Privacy</span>.
        </p>
      </div>
    </div>
  );
}