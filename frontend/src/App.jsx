import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import FacilitiesAdmin from './components/FacilitiesAdmin';
import FacilitiesUser from './components/FacilitiesUser';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f172a]">
        <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              SmartCampus
            </Link>
            <div className="flex gap-6">
              <Link to="/facilities" className="text-slate-400 hover:text-white transition-colors font-medium">
                View Facilities
              </Link>
              <Link to="/admin/facilities" className="text-slate-400 hover:text-white transition-colors font-medium px-4 py-2 bg-slate-800 rounded-lg border border-slate-700">
                Admin Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<FacilitiesUser />} />
          <Route path="/facilities" element={<FacilitiesUser />} />
          <Route path="/admin/facilities" element={<FacilitiesAdmin />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
