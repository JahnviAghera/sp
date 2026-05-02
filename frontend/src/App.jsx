import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Spinner from './components/ui/Spinner';

// Lazy loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const RoomPage = lazy(() => import('./pages/Room')); // Remote has Room.jsx
const CreateRoomPage = lazy(() => import('./pages/CreateRoomPage'));
const ProfilePage = lazy(() => import('./pages/Profile')); // Remote has Profile.jsx
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LeaderboardPage = lazy(() => import('./pages/Leaderboard')); // Remote has Leaderboard.jsx
const AdminPage = lazy(() => import('./pages/AdminPanel')); // Remote has AdminPanel.jsx
const SessionReport = lazy(() => import('./pages/SessionReport'));

function App() {
  return (
    <>
      <Router>
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-dark-900 text-white">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/rooms/new" element={<ProtectedRoute><CreateRoomPage /></ProtectedRoute>} />
              <Route path="/rooms/:code" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
              <Route path="/room/:code" element={<ProtectedRoute><RoomPage /></ProtectedRoute>} />
              <Route path="/report/:code" element={<ProtectedRoute><SessionReport /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/profile/edit" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><LeaderboardPage /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-right" />
    </>
  );
}

export default App;

