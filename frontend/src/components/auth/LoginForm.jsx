import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useAuthStore from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const LoginForm = () => {
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <Input
        {...register('email')}
        type="email"
        placeholder="Email"
        className={errors.email ? 'border-red-500' : ''}
      />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      
      <Input
        {...register('password')}
        type="password"
        placeholder="Password"
        className={errors.password ? 'border-red-500' : ''}
      />
      {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? <Spinner /> : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;