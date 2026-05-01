import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Settings, Mic } from 'lucide-react';
import Avatar from '../ui/Avatar';

const Navbar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-40 w-full glass border-b border-white/5 bg-dark-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center mr-3 shadow-glow">
              <Mic size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              SpeakSpace
            </span>
          </div>

          {/* Right side nav items */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <button className="text-slate-400 hover:text-white transition-colors">
                  <Settings size={20} />
                </button>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
                    <p className="text-xs text-slate-400">Speaker</p>
                  </div>
                  <Avatar 
                    src={user.avatar} 
                    alt={user.name} 
                    status="online"
                    className="cursor-pointer"
                  />
                  <button 
                    onClick={onLogout}
                    className="ml-2 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary px-4 py-2 text-sm rounded-lg shadow-none">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
