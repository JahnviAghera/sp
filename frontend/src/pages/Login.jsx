import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-20 p-8 bg-dark-800 rounded-xl shadow-lg border border-dark-700">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">Welcome Back</h2>
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4 text-white">
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input 
            type="email" 
            placeholder="you@example.com" 
            className="input-field w-full" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            className="input-field w-full" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button 
          type="submit" 
          className={`btn-primary w-full mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}

