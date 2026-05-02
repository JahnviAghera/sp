import React from 'react';
import Button from '../ui/Button';
import useAuthStore from '../../store/useAuthStore';

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <Button onClick={handleGoogleLogin} className="w-full bg-red-600 hover:bg-red-700">
      Sign in with Google
    </Button>
  );
};

export default GoogleLoginButton;