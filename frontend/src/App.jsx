import React, { useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation 
} from 'react-router-dom';

// Contexts
import { AuthProvider, useAuth, API_BASE_URL } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Pages
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateUrl from './pages/CreateUrl';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import PublicStats from './pages/PublicStats';
import Expired from './pages/Expired';

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !token) {
      navigate('/login');
    }
  }, [token, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return token ? children : null;
}

// Inner router shell to access routing hooks (like useNavigate, useLocation)
function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing navigate={navigate} />} />
      <Route path="/login" element={<Login navigate={navigate} />} />
      <Route path="/register" element={<Register navigate={navigate} />} />
      <Route path="/stats/:shortCode" element={<PublicStats />} />
      <Route path="/expired" element={<Expired />} />

      {/* Protected Dashboard Pages */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout currentPath={currentPath} navigate={navigate}>
              <Dashboard navigate={navigate} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/create" 
        element={
          <ProtectedRoute>
            <Layout currentPath={currentPath} navigate={navigate}>
              <CreateUrl navigate={navigate} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/analytics/:id" 
        element={
          <ProtectedRoute>
            <Layout currentPath={currentPath} navigate={navigate}>
              <Analytics navigate={navigate} />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <Layout currentPath={currentPath} navigate={navigate}>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } 
      />

      {/* 404 Fallback to Client Redirection Handler */}
      <Route path="*" element={<RedirectHandler />} />
    </Routes>
  );
}

// Dynamic Client Redirection Handler
function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.substring(1); // Get code after "/"
    
    // List of standard frontend routes to bypass
    const standardRoutes = ['dashboard', 'create', 'settings', 'stats', 'expired', 'login', 'register'];
    const firstSegment = path.split('/')[0];

    if (path && !standardRoutes.includes(firstSegment)) {
      // Redirect browser directly to backend redirect logic
      const backendUrl = API_BASE_URL.replace('/api', '');
      window.location.href = `${backendUrl}/${path}`;
    } else {
      // If no code, send to Landing Page
      navigate('/', { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Redirecting to destination...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppShell />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
