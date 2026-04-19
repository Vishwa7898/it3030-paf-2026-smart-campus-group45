import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, ShieldCheck, BellRing, Users, Sparkles, Building2, CalendarCheck, Ticket } from 'lucide-react';

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500/30">
      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 tracking-tight">
              SmartCampus
            </span>
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <Link 
                to="/login" 
                className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
              >
                Sign In
              </Link>
            ) : (
              <Link 
                to={isAdmin ? "/admin" : "/facilities"} 
                className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=2000" 
            alt="University Campus" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-bold shadow-sm mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Next-Gen University Platform
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Campus Management
            </span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            A unified, intelligent ecosystem designed to seamlessly connect students, staff, and administrators. Manage facilities, bookings, and incident tickets all in one place.
          </p>

          {!user ? (
            <Link 
              to="/login" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1"
            >
              Get Started Now <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link 
              to={isAdmin ? "/admin" : "/facilities"} 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
            >
              Access Your Portal <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24 bg-slate-50 relative z-20 -mt-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need, perfectly integrated.</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Designed from the ground up to provide a flawless experience for the entire campus community.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Facility Catalogue</h3>
              <p className="text-slate-600 leading-relaxed">
                Browse through all campus facilities, view real-time availability, and explore detailed resources with high-quality images.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Bookings</h3>
              <p className="text-slate-600 leading-relaxed">
                Reserve lecture halls, study rooms, and lab equipment instantly. Our intelligent system prevents double-booking conflicts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <Ticket className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Incident Ticketing</h3>
              <p className="text-slate-600 leading-relaxed">
                Report damages or issues quickly. Track the repair progress in real-time as technicians and admins handle the workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Info Section */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                Secure, Reliable, and <br/><span className="text-indigo-600">Built for Scale.</span>
              </h2>
              <p className="text-slate-600 text-lg mb-8 leading-relaxed">
                Our platform leverages enterprise-grade security with role-based access control (RBAC), ensuring that students, staff, and administrators only access what they need. Backed by a robust microservices architecture.
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><ShieldCheck className="w-5 h-5"/></div>
                  OAuth2 Google Authentication
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="p-1 rounded-full bg-indigo-100 text-indigo-600"><Users className="w-5 h-5"/></div>
                  Dedicated Admin & Technician Portals
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <div className="p-1 rounded-full bg-purple-100 text-purple-600"><BellRing className="w-5 h-5"/></div>
                  Real-time Application Notifications
                </li>
              </ul>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=1000" 
                alt="Students collaborating" 
                className="relative rounded-3xl shadow-2xl border border-white/20 object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="text-indigo-400 w-5 h-5" />
            <span className="text-xl font-bold text-white">SmartCampus</span>
          </div>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Empowering universities with intelligent digital infrastructure for a better tomorrow.
          </p>
          <div className="text-sm text-slate-600 border-t border-slate-800 pt-8">
            &copy; {new Date().getFullYear()} Smart Campus Group 45. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
