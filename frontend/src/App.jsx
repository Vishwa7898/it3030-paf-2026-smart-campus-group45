import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // path එක ඔබ දැනට පාවිච්චි කරන එකට වෙනස් කරගන්න
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
import MyBookingsPage from './booking/MyBookingsPage';
import CreateBookingPage from './booking/CreateBookingPage';
import AdminBookingsPage from './booking/AdminBookingsPage';

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

/** Module B — booking links (user vs admin). */
function BookingNavLinks() {
  const { isAdmin } = useAuth();
  return (
    <>
      <NavLink to="/bookings" className={navLinkClass}>
        My bookings
      </NavLink>
      {isAdmin && (
        <NavLink to="/admin/bookings" className={navLinkClass}>
          Booking management
        </NavLink>
      )}
    </>
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
                  <BookingNavLinks />
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
                <Route path="admin" element={<AdminDashboard />} />
                
                {/* Facilities Section */}
                <Route path="facilities" element={<FacilitiesUser />} />
                <Route path="facilities/:id" element={<FacilitiesUser />} />
                <Route path="admin/facilities" element={<FacilitiesAdmin />} />

                {/* Module B — Booking Management */}
                <Route path="bookings" element={<MyBookingsPage />} />
                <Route path="bookings/new" element={<CreateBookingPage />} />
                <Route path="admin/bookings" element={<AdminBookingsPage />} />

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