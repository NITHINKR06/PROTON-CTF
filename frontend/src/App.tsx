import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ChallengeProvider } from './hooks/useChallengeState';
import { LoginPage } from './pages/LoginPage';
import { ChallengePage } from './pages/ChallengePage';
import { AdminPage } from './pages/AdminPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <span className="text-green-500 font-bold text-xl">LOADING<span className="blink">█</span></span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/challenge" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/challenge"
        element={
          <ProtectedRoute>
            <ChallengeProvider>
              <ChallengePage />
            </ChallengeProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;