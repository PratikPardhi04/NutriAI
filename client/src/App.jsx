import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import MarketingLanding from './pages/MarketingLanding';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  const { user } = useAuthStore();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuthStore();
  if (user) {
    if (localStorage.getItem('justRegistered') === 'true') {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicRoute><MarketingLanding /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Landing initialMode="login" /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Landing initialMode="register" /></PublicRoute>} />
        
        {/* Onboarding must be private so authenticated users aren't bumped, but doesn't share layout */}
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

        <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="/home" element={<Home />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
