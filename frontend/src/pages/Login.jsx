import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Shield, Wrench } from 'lucide-react';
import googleLogo from '../assets/google-g.png';

// Demo card විස්තර
const demoRoles = [
  {
    role: 'STUDENT',
    title: 'Student Access',
    subtitle: 'Submit tickets and track your own facility reports.',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400/40',
    cta: 'Sign in as Student (Google)',
  },
  {
    role: 'ADMIN',
    title: 'Admin Access',
    subtitle: 'Manage all tickets, assign technicians, and control workflow.',
    icon: Shield,
    gradient: 'from-violet-600 to-indigo-700',
    ring: 'ring-violet-400/40',
    cta: 'Sign in as Admin (Google)',
  },
  {
    role: 'TECHNICIAN',
    title: 'Technician Access',
    subtitle: 'Update status and resolve tickets assigned specifically to you.',
    icon: Wrench,
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-400/40',
    cta: 'Sign in as Technician (Google)',
  },
];

export default function Login() {
  const { user, login } = useAuth();

  // දැනටමත් login වී ඇත්නම් අදාළ තැනට යොමු කරන්න
  if (user) {
    return <Navigate to="/facilities" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left (Orange) Panel */}
        <div className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full border border-white/20 opacity-40" />
            <div className="absolute top-24 left-24 h-[32rem] w-[32rem] rounded-full border border-white/15 opacity-30" />
            <div className="absolute -bottom-28 -right-28 h-[28rem] w-[28rem] rounded-full bg-indigo-400/10 blur-2xl" />
          </div>

          <div className="relative z-10 max-w-md px-12">
            <div className="flex items-center justify-center">
              <div className="w-64 h-64 rounded-[3rem] bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl flex items-center justify-center">
                <GraduationCap className="w-24 h-24 text-white/90" />
              </div>
            </div>

            <p className="mt-10 text-center text-white/90 font-semibold text-xl leading-snug">
              SmartCampus Portal
            </p>
            <p className="mt-2 text-center text-white/75 text-sm">
              Secure access for Students, Admins, and Technicians.
            </p>
          </div>
        </div>

        {/* Right (Form) Panel */}
        <div className="flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                SC
              </div>
              <div className="font-semibold text-slate-700">SmartCampus</div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Login
            </h1>
            <p className="mt-2 text-slate-500 text-sm">
              Enter your credentials to login to your account
            </p>

            <div className="mt-8 space-y-3">
              {demoRoles.map(({ role, title, icon: Icon, cta }) => (
                <button
                  key={role}
                  type="button"
                  onClick={login}
                  className="w-full flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-slate-300 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                  aria-label={cta}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{title}</div>
                      <div className="text-xs text-slate-500 truncate">{cta}</div>
                    </div>
                  </div>
                  <img
                    src={googleLogo}
                    alt="Google Logo"
                    className="w-5 h-5 shrink-0"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-slate-600 select-none">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                Remember me
              </label>
              <button type="button" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                Forgot Password?
              </button>
            </div>

            <p className="mt-10 text-xs text-slate-500">
              Secure authentication powered by Smart Campus Identity. By signing in, you agree to our{' '}
              <span className="text-indigo-600 hover:underline cursor-pointer">Terms & Privacy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}