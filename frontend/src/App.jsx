import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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