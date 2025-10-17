import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Login from './Login';
import Register from './Register';

const AuthModal = ({ open, onClose, initialMode = 'login' }) => {
  const { user } = useAuth();
  const [authMode, setAuthMode] = React.useState(initialMode);

  React.useEffect(() => {
    if (user) {
      onClose();
    }
  }, [user, onClose]);

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
        open={open && authMode === 'login'} 
        onClose={onClose}
        switchToRegister={switchToRegister}
      />
      <Register 
        open={open && authMode === 'register'} 
        onClose={onClose}
        switchToLogin={switchToLogin}
      />
    </>
  );
};

export default AuthModal;