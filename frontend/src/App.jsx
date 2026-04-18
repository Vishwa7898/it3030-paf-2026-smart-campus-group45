import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components & Pages
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import FacilitiesAdmin from './components/FacilitiesAdmin';
import FacilitiesUser from './components/FacilitiesUser';

import './App.css';

// Active link styling for Navigation
const navLinkClass = ({ isActive }) =>
  `font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive ? 'text-white bg-slate-800 border border-slate-600' : 'text-slate-400 hover:text-white'
  }`;

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-[#0f172a]">
            {/* Navigation Bar */}
            <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                <NavLink
                  to="/"
                  className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500"
                >
                  SmartCampus
                </NavLink>
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                  <NavLink to="/facilities" end className={navLinkClass}>
                    Facilities catalogue
                  </NavLink>
                  <NavLink to="/admin/facilities" className={navLinkClass}>
                    Resource management
                  </NavLink>
                </div>
              </div>
            </nav>

            {/* Routes Configuration */}
            <Routes>
              {/* Layout එක ඇතුළේ වැඩ කරන Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="admin" element={<AdminDashboard />} />
                
                {/* Facilities Routes */}
                <Route path="facilities" element={<FacilitiesUser />} />
                <Route path="facilities/:id" element={<FacilitiesUser />} />
                <Route path="admin/facilities" element={<FacilitiesAdmin />} />
                
                {/* Catch-all route (404) - මෙතැනදී facilities වලට redirect කිරීම හෝ 404 පෙන්වීම කළ හැක */}
                <Route path="*" element={<Navigate to="/facilities" replace />} />
              </Route>
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;