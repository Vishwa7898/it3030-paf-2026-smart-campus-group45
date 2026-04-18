import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import './App.css'; // Leaving this import in case it's needed later

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="admin" element={<AdminDashboard />} />
              
              {/* 
                === TEAM MEMBERS ROUTES GO HERE ===
                Example:
                <Route path="food-orders" element={<FoodOrders />} />
                <Route path="transport" element={<Transport />} />
              */}
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <h2>404 - Page Not Found</h2>
                  <p style={{ color: 'var(--text-muted)' }}>The page you are looking for does not exist.</p>
                </div>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
