import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/useAuthStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const LoginPage = () => {
  const { login, user, error, loading } = useAuthStore();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-bg-primary bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-bg-primary to-bg-primary">
      <div className="glass-strong p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-center text-white">Welcome Back</h1>
          <p className="text-slate-400 text-center mb-8">Sign in to continue your practice.</p>
          
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm text-center">{error}</div>}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <Input 
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.email.message}</p>}
            </div>

            <div>
              <Input 
                label="Password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.password.message}</p>}
            </div>
            
            <div className="flex justify-end">
              <Link to="/forgot-password" virtual="true" className="text-xs font-bold text-brand-400 hover:text-brand-300 transition-colors uppercase tracking-widest">Forgot Password?</Link>
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
                size="lg"
              >
                Sign In
              </Button>
            </div>
          </form>
          
          <p className="mt-8 text-center text-slate-400 text-sm">
            Don't have an account? <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
