import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { GraduationCap, Shield, Wrench, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { DEMO_ACCOUNTS } from '../auth/authStorage';

const cards = [
  {
    key: 'student',
    account: DEMO_ACCOUNTS.student,
    title: 'Student login',
    subtitle: 'Submit tickets and track your own reports (OPEN → CLOSED).',
    icon: GraduationCap,
    gradient: 'from-emerald-500 to-teal-600',
    ring: 'ring-emerald-400/40',
  },
  {
    key: 'admin',
    account: DEMO_ACCOUNTS.admin,
    title: 'Admin login',
    subtitle: 'View every ticket, assign technicians, run workflow & reject with reason.',
    icon: Shield,
    gradient: 'from-violet-600 to-indigo-700',
    ring: 'ring-violet-400/40',
  },
  {
    key: 'technician',
    account: DEMO_ACCOUNTS.technician,
    title: 'Technician login',
    subtitle: 'Work on tickets assigned to you; resolve with notes when you are the assignee.',
    icon: Wrench,
    gradient: 'from-amber-500 to-orange-600',
    ring: 'ring-amber-400/40',
  },
];

export default function Login() {
  const { login, user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && user) navigate('/tickets', { replace: true });
  }, [ready, user, navigate]);

  const enterAs = (account) => {
    login(account);
    navigate('/tickets', { replace: true });
  };

  return (
    <div className="min-h-screen app-bg-mesh flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-indigo-100 text-indigo-700 text-sm font-medium shadow-sm mb-4">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Module C — Maintenance &amp; incident ticketing
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            SmartCampus{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              sign in
            </span>
          </h1>
          <p className="mt-3 text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Choose a demo role for your viva: students see only their tickets and progress; admins see
            all tickets and control the workflow including{' '}
            <strong className="text-slate-800">REJECTED</strong> with a reason.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {cards.map(({ key, account, title, subtitle, icon: Icon, gradient, ring }) => (
            <button
              key={key}
              type="button"
              onClick={() => enterAs(account)}
              className={`text-left rounded-2xl bg-white/90 backdrop-blur border border-white/80 p-6 shadow-lg shadow-indigo-900/10 hover:shadow-xl hover:shadow-indigo-900/15 transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 ${ring}`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-4 shadow-md`}
              >
                <Icon className="w-6 h-6" strokeWidth={2} />
              </div>
              <h2 className="font-bold text-lg text-slate-900">{title}</h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">{subtitle}</p>
              <p className="mt-4 text-xs font-mono text-slate-400">ID: {account.id}</p>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-slate-500 mt-10 max-w-md mx-auto">
          This is a <strong>demo login</strong> for coursework. Your team can replace it with OAuth (Module E)
          while keeping the same ticket rules on the API.
        </p>
      </div>
    </div>
  );
}
