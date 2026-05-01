import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Leaderboard from './pages/Leaderboard';
import Schedules from './pages/Schedules';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import useAuthStore from './store/authStore';

function App() {
  const { user, token, fetchProfile, logout } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, [token, user, fetchProfile]);

  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col">
        <header className="px-6 py-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-8">
            <Link to="/dashboard">
              <h1 className="text-2xl font-black text-brand-500 tracking-tighter">SpeakSpace</h1>
            </Link>
            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
              <Link to="/schedules" className="text-gray-400 hover:text-white transition-colors">Schedules</Link>
              <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin</Link>
              <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
             {user ? (
               <div className="flex items-center space-x-3">
                 <Link to="/profile" className="w-8 h-8 bg-brand-500/20 rounded-full border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-500">
                   {user.name?.charAt(0)}
                 </Link>
                 <button onClick={logout} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Logout</button>
               </div>
             ) : (
               <Link to="/" className="text-sm font-bold text-brand-500">Login</Link>
             )}
          </div>
        </header>
        <main className="flex-grow flex flex-col p-6">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/room/:code" element={<Room />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/schedules" element={<Schedules />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

