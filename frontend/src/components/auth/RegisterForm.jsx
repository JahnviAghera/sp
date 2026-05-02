import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import useAuthStore from '../../store/useAuthStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useNavigate } from 'react-router-dom';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const RegisterForm = () => {
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  const registerUser = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}
      <Input
        {...register('name')}
        type="text"
        placeholder="Name"
        className={errors.name ? 'border-red-500' : ''}
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      
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
        {isSubmitting ? <Spinner /> : 'Register'}
      </Button>
    </form>
  );
};

export default RegisterForm;