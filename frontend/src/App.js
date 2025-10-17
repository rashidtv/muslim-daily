import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Container,
  Chip
} from '@mui/material';
import {
  AccountCircle,
  Login,
  Logout,
  PersonAdd,
  Mosque,
  Notifications
} from '@mui/icons-material';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PracticeProvider } from './context/PracticeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Home from './pages/Home';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import AuthModal from './components/Auth/AuthModal';

// Modern professional theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32', // Islamic green
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF9800', // Golden accent
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#f8fdf8', // Very light green
      paper: '#ffffff',
    },
    text: {
      primary: '#1B5E20',
      secondary: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(46, 125, 50, 0.1)',
          border: '1px solid #e8f5e8',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(46, 125, 50, 0.15)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '10px 24px',
          fontWeight: 600,
          textTransform: 'none',
          transition: 'all 0.3s ease',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(46, 125, 50, 0.4)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1B5E20',
          boxShadow: '0 2px 20px rgba(46, 125, 50, 0.1)',
          borderBottom: '1px solid #e8f5e8',
        },
      },
    },
  },
});

// User Profile Menu Component
const UserMenu = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  if (!user) return null;

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          icon={<AccountCircle />}
          label={user.name}
          variant="outlined"
          color="primary"
          onClick={handleMenu}
          sx={{
            cursor: 'pointer',
            borderColor: '#4CAF50',
            color: '#1B5E20',
            '&:hover': {
              backgroundColor: '#f1f8e9',
            },
          }}
        />
        <IconButton
          onClick={handleMenu}
          sx={{
            color: '#1B5E20',
            backgroundColor: '#f1f8e9',
            '&:hover': {
              backgroundColor: '#e8f5e8',
            },
          }}
        >
          <AccountCircle />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            borderRadius: 3,
            boxShadow: '0 8px 30px rgba(46, 125, 50, 0.15)',
            border: '1px solid #e8f5e8',
          },
        }}
      >
        <MenuItem sx={{ cursor: 'default', '&:hover': { backgroundColor: 'transparent' } }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <AccountCircle sx={{ mr: 2, color: '#4CAF50' }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <Notifications sx={{ mr: 2, color: '#4CAF50' }} />
          Notifications
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#d32f2f' }}>
          <Logout sx={{ mr: 2 }} />
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

// Auth Buttons Component
const AuthButtons = () => {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = () => {
    setAuthMode('login');
    setAuthModalOpen(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setAuthModalOpen(true);
  };

  if (user) return <UserMenu />;

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        startIcon={<Login />}
        onClick={handleLogin}
        variant="outlined"
        sx={{
          borderColor: '#4CAF50',
          color: '#1B5E20',
          '&:hover': {
            borderColor: '#2E7D32',
            backgroundColor: '#f1f8e9',
          },
        }}
      >
        Login
      </Button>
      <Button
        startIcon={<PersonAdd />}
        onClick={handleRegister}
        variant="contained"
        sx={{
          backgroundColor: '#2E7D32',
          '&:hover': {
            backgroundColor: '#1B5E20',
          },
        }}
      >
        Register
      </Button>
      
      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </Box>
  );
};

// Modern Header Component
const Header = () => {
  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Mosque sx={{ fontSize: 32, color: '#2E7D32', mr: 2 }} />
            <Typography variant="h5" component="div" fontWeight="700">
              Muslim<span style={{ color: '#FF9800' }}>Daily</span>
            </Typography>
          </Box>

          {/* Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 4 }}>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Prayer Times
            </Button>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Progress
            </Button>
            <Button color="inherit" sx={{ fontWeight: 600 }}>
              Quran
            </Button>
          </Box>

          {/* Auth Controls */}
          <AuthButtons />
        </Container>
      </Toolbar>
    </AppBar>
  );
};

// PWA Install Prompt Component
const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(46, 125, 50, 0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        border: '2px solid white',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 40px rgba(46, 125, 50, 0.4)',
        },
      }}
      onClick={installApp}
    >
      <span style={{ fontSize: '20px' }}>📱</span>
      Install App
    </Box>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PracticeProvider>
          <Router>
            <Box sx={{ 
              minHeight: '100vh', 
              background: 'linear-gradient(135deg, #f8fdf8 0%, #e8f5e8 100%)',
              position: 'relative',
            }}>
              {/* Background Pattern */}
              <Box
                sx={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `
                    radial-gradient(circle at 20% 80%, rgba(76, 175, 80, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(255, 152, 0, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 40% 40%, rgba(46, 125, 50, 0.03) 0%, transparent 50%)
                  `,
                  zIndex: 0,
                }}
              />
              
              {/* Content */}
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Header />
                
                <Container maxWidth="lg" sx={{ py: 4 }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Home />} />
                  </Routes>
                </Container>
              </Box>

              {/* PWA Install Prompt */}
              <PWAInstallPrompt />
            </Box>
          </Router>
        </PracticeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;