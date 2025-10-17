import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthModal = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState(null);

  React.useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => {
        setAuthMode('login');
      }, 1000);
    }
  }, [loading, user]);

  const handleClose = () => {
    setAuthMode(null);
  };

  const switchToRegister = () => {
    setAuthMode('register');
  };

  const switchToLogin = () => {
    setAuthMode('login');
  };

  if (user) return null;

  return (
    <>
      <Login 
        open={authMode === 'login'} 
        onClose={handleClose}
        switchToRegister={switchToRegister}
      />
      <Register 
        open={authMode === 'register'} 
        onClose={handleClose}
        switchToLogin={switchToLogin}
      />
    </>
  );
};

export default AuthModal;