import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink
} from 'react-router-dom';
import FacilitiesAdmin from './components/FacilitiesAdmin';
import FacilitiesUser from './components/FacilitiesUser';
import './App.css';

const navLinkClass = ({ isActive }) =>
  `font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive ? 'text-white bg-slate-800 border border-slate-600' : 'text-slate-400 hover:text-white'
  }`;

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a]">
        <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
            <NavLink
              to="/facilities"
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

        <Routes>
          <Route path="/" element={<Navigate to="/facilities" replace />} />
          <Route path="/facilities" element={<FacilitiesUser />} />
          <Route path="/facilities/:id" element={<FacilitiesUser />} />
          <Route path="/admin/facilities" element={<FacilitiesAdmin />} />
          <Route path="*" element={<Navigate to="/facilities" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
