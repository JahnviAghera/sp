import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      await axios.post(`${apiUrl}/api/auth/forgot-password`, data);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-bg-primary bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-900/20 via-bg-primary to-bg-primary">
      <div className="glass-strong p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-2xl relative overflow-hidden text-center">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 text-white">Reset Password</h1>
          <p className="text-slate-400 mb-8">Enter your email and we'll send you a link to reset your password.</p>
          
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm">{error}</div>}
          
          {success ? (
            <div className="space-y-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-2xl">
                <p className="text-sm leading-relaxed">If an account exists with that email, a password reset link has been sent. Please check your inbox and your console (in dev).</p>
              </div>
              <Link to="/login">
                <Button className="w-full mt-4" variant="outline">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-left">
              <div>
                <Input 
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-bold uppercase tracking-widest">{errors.email.message}</p>}
              </div>

              <Button 
                type="submit" 
                loading={loading}
                className="w-full"
                size="lg"
              >
                Send Reset Link
              </Button>
            </form>
          )}
          
          {!success && (
            <p className="mt-8 text-center text-slate-400 text-sm">
              Remembered your password? <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
