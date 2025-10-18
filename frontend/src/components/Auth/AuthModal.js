import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Container,
  IconButton
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const AuthModal = ({ open, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { login, register } = useAuth();

  const handleTabChange = (event, newValue) => {
    setMode(newValue);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // In your AuthModal.js, update the handleSubmit function:
const handleSubmit = async (formData) => {
  try {
    let result;
    
    if (mode === 'login') {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData.name, formData.email, formData.password);
    }

    if (result.success) {
      setSnackbar({ open: true, message: `Successfully ${mode === 'login' ? 'signed in' : 'registered'}!`, severity: 'success' });
      onClose();
    } else {
      setSnackbar({ open: true, message: result.error, severity: 'error' });
    }
  } catch (error) {
    setSnackbar({ open: true, message: error.message, severity: 'error' });
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 0
        }}
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider', position: 'relative' }}>
          <Tabs value={mode} onChange={handleTabChange} centered>
            <Tab label="Sign In" value="login" />
            <Tab label="Create Account" value="register" />
          </Tabs>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <Close />
          </IconButton>
        </Box>

        <Container sx={{ py: 3 }}>
          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            )}
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            {mode === 'register' && (
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </Container>
      </Box>
    </Modal>
  );
};

export default AuthModal;