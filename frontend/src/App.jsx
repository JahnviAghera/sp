import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoomPage = lazy(() => import('./pages/RoomPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

function App() {
  // Temporary mock user for UI testing
  const mockUser = { name: 'Test User', avatar: '' };

  return (
    <Router>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-dark-900"><Spinner size="xl" /></div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/room/:id" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <RoomPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/analytics" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <AnalyticsPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/leaderboard" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <LeaderboardPage />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute isAuthenticated={true}>
              <AppLayout user={mockUser}>
                <AdminPage />
              </AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
