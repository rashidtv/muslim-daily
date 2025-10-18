import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('muslimDiary_user');
    const token = localStorage.getItem('muslimDiary_token');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('muslimDiary_user');
        localStorage.removeItem('muslimDiary_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Dynamic API URL for different environments
      const getApiBase = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        return 'https://muslimdailybackend.onrender.com';
      };

      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Use ACTUAL user data from backend
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          zone: data.user.zone
        };
        
        setUser(userData);
        localStorage.setItem('muslimDiary_user', JSON.stringify(userData));
        localStorage.setItem('muslimDiary_token', data.token);
        
        return { success: true, user: userData };
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (name, email, password) => {
    try {
      // Dynamic API URL for different environments
      const getApiBase = () => {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        return 'https://muslimdailybackend.onrender.com';
      };

      const API_BASE = getApiBase();
      
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Use ACTUAL user data from backend
        const userData = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          zone: data.user.zone
        };
        
        setUser(userData);
        localStorage.setItem('muslimDiary_user', JSON.stringify(userData));
        localStorage.setItem('muslimDiary_token', data.token);
        
        return { success: true, user: userData };
      } else {
        throw new Error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('muslimDiary_user');
    localStorage.removeItem('muslimDiary_token');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};