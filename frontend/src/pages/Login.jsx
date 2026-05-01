import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Placeholder login logic
    navigate('/dashboard');
  };

  return (
    <div className="max-w-md w-full mx-auto mt-20 p-8 bg-dark-800 rounded-xl shadow-lg border border-dark-700">
      <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block mb-1 text-sm font-medium">Email</label>
          <input type="email" placeholder="you@example.com" className="input-field" required />
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium">Password</label>
          <input type="password" placeholder="••••••••" className="input-field" required />
        </div>
        <button type="submit" className="btn-primary w-full mt-4">
          Sign In
        </button>
      </form>
    </div>
  );
}
