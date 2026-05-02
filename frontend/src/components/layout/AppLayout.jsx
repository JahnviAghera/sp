import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const AppLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col">
      <header className="px-6 py-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard">
            <h1 className="text-2xl font-black text-brand-500 tracking-tighter">SpeakSpace</h1>
          </Link>
          <nav className="hidden md:flex space-x-6 text-sm font-medium">
            <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            <Link to="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</Link>
            <Link to="/analytics" className="text-gray-400 hover:text-white transition-colors">Analytics</Link>
            <Link to="/admin" className="text-gray-400 hover:text-white transition-colors">Admin</Link>
            <Link to="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</Link>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
           {user ? (
             <div className="flex items-center space-x-3">
               <Link to="/profile" className="w-8 h-8 bg-brand-500/20 rounded-full border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-500">
                 {user.name?.charAt(0) || 'U'}
               </Link>
               <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-500 transition-colors">Logout</button>
             </div>
           ) : (
             <Link to="/login" className="text-sm font-bold text-brand-500">Login</Link>
           )}
        </div>
      </header>
      <main className="flex-grow flex flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
