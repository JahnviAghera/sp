import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Room from './pages/Room';
import Leaderboard from './pages/Leaderboard';
import Schedules from './pages/Schedules';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col">
        <header className="px-6 py-4 border-b border-dark-800 flex justify-between items-center bg-dark-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-black text-brand-500 tracking-tighter">SpeakSpace</h1>
            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</a>
              <a href="/leaderboard" className="text-gray-400 hover:text-white transition-colors">Leaderboard</a>
              <a href="/schedules" className="text-gray-400 hover:text-white transition-colors">Schedules</a>
              <a href="/admin" className="text-gray-400 hover:text-white transition-colors">Admin</a>
              <a href="/profile" className="text-gray-400 hover:text-white transition-colors">Profile</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 bg-dark-700 rounded-full border border-dark-600"></div>
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
