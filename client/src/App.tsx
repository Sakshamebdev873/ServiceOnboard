import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import your pages
import ServiceOnboardForm from './pages/ServiceOnboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Props interface for ProtectedRoute
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuth = localStorage.getItem('adminAuthenticated');
  return isAuth ? <>{children}</> : <Navigate to="/admin" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public User Route */}
        <Route path="/" element={<ServiceOnboardForm />} />

        {/* Admin Login */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* Protected Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;