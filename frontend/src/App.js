import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
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
  Chip,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import {
  AccountCircle,
  Login,
  Logout,
  PersonAdd,
  Mosque,
  Home as HomeIcon,
  Analytics,
  Settings as SettingsIcon,
  Menu as MenuIcon
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
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
    },
    secondary: {
      main: '#FF9800',
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#f8fdf8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 12 },
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
        },
      },
    },
  },
});

// User Profile Menu Component
const UserMenu = () => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

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

  const handleNavigate = (path) => {
    navigate(path);
    handleClose();
  };

  if (!user) return null;

  return (
    <div>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip 
          avatar={<Avatar sx={{ width: 24, height: 24, bgcolor: '#4CAF50' }}>
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>}
          label={user.name}
          variant="outlined"
          onClick={handleMenu}
          sx={{ cursor: 'pointer', borderColor: '#4CAF50' }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { mt: 1.5, borderRadius: 3 } }}
      >
        <MenuItem sx={{ cursor: 'default' }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/progress')}>
          <Analytics sx={{ mr: 2, color: '#4CAF50' }} />
          My Progress
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <SettingsIcon sx={{ mr: 2, color: '#4CAF50' }} />
          Settings
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
        sx={{ borderColor: '#4CAF50', color: '#1B5E20' }}
      >
        Login
      </Button>
      <Button
        startIcon={<PersonAdd />}
        onClick={handleRegister}
        variant="contained"
        sx={{ backgroundColor: '#2E7D32' }}
      >
        Register
      </Button>
      
      <AuthModal 
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </Box>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Progress', icon: <Analytics />, path: '/progress' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }} elevation={3}>
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            sx={{
              color: location.pathname === item.path ? '#2E7D32' : 'inherit',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

// Modern Header Component
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Progress', path: '/progress' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar>
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <Mosque sx={{ fontSize: 32, color: '#2E7D32', mr: 2 }} />
            <Typography variant="h5" component="div" fontWeight="700">
              Muslim<span style={{ color: '#FF9800' }}>Daily</span>
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, mr: 4 }}>
            {navigationItems.map((item) => (
              <Button
                key={item.path}
                color="inherit"
                onClick={() => navigate(item.path)}
                sx={{
                  fontWeight: 600,
                  color: location.pathname === item.path ? '#2E7D32' : 'inherit',
                  borderBottom: location.pathname === item.path ? '2px solid #2E7D32' : 'none',
                  borderRadius: 0,
                }}
              >
                {item.label}
              </Button>
            ))}
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
        bottom: { xs: 70, md: 24 },
        right: 24,
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(46, 125, 50, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        fontSize: '14px',
        fontWeight: '600',
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
              pb: { xs: 7, md: 0 }, // Space for mobile bottom nav
            }}>
              <Header />
              
              <Container maxWidth="lg" sx={{ py: 3 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Container>

              {/* Mobile Bottom Navigation */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileBottomNav />
              </Box>

              <PWAInstallPrompt />
            </Box>
          </Router>
        </PracticeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;