import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // path එක ඔබ දැනට පාවිච්චි කරන එකට වෙනස් කරගන්න
import { NotificationProvider } from './context/NotificationContext';

// Auth Components
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import TicketList from './pages/tickets/TicketList';
import CreateTicket from './pages/tickets/CreateTicket';
import TicketDetails from './pages/tickets/TicketDetails';
import FacilitiesAdmin from './components/FacilitiesAdmin';
import FacilitiesUser from './components/FacilitiesUser';
import AdminLayout from './components/AdminLayout';
import NotificationAdmin from './pages/admin/NotificationAdmin';
import UserManagement from './pages/admin/UserManagement';

import './App.css';

// Navigation styling
const navLinkClass = ({ isActive }) =>
  `font-medium transition-colors px-3 py-2 rounded-lg ${
    isActive ? 'text-white bg-slate-800 border border-slate-600' : 'text-slate-400 hover:text-white'
  }`;

// Authentication අවශ්‍ය Layout එක මෙතැනදී සකසා ගමු
function ProtectedLayout() {
  return (
    <RequireAuth>
      <Layout>
        <Outlet />
      </Layout>
    </RequireAuth>
  );
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-[#0f172a]">
            {/* Navigation Bar */}
            <nav className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-50">
              <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-4">
                <NavLink to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                  SmartCampus
                </NavLink>
                <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
                  <NavLink to="/facilities" className={navLinkClass}>Facilities</NavLink>
                  <NavLink to="/tickets" className={navLinkClass}>Tickets</NavLink>
                  <NavLink to="/admin/facilities" className={navLinkClass}>Management</NavLink>
                </div>
              </div>
            </nav>

            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes (Authentication අවශ්‍යයි) */}
              <Route element={<ProtectedLayout />}>
                <Route index element={<Home />} />
                <Route path="notifications" element={<Notifications />} />
                
                {/* Admin Nested Routes */}
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="notifications" element={<NotificationAdmin />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="facilities" element={<FacilitiesAdmin />} />
                  {/* Placeholders for team members to link later */}
                  <Route path="tickets" element={<TicketList />} />
                  <Route path="tickets/:id" element={<TicketDetails />} />
                  <Route path="bookings" element={<div className="flex items-center justify-center h-64 text-slate-400 font-medium">Bookings Management (Pending Implementation)</div>} />
                </Route>

                {/* Facilities Section */}
                <Route path="facilities" element={<FacilitiesUser />} />
                <Route path="facilities/:id" element={<FacilitiesUser />} />

                {/* Ticketing Section */}
                <Route path="tickets" element={<TicketList />} />
                <Route path="tickets/new" element={<CreateTicket />} />
                <Route path="tickets/:id" element={<TicketDetails />} />
              </Route>

              {/* 404 - Redirect to facilities or home */}
              <Route path="*" element={<Navigate to="/facilities" replace />} />
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;