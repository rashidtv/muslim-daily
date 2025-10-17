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
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery
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
  Menu as MenuIcon,
  Close
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
    h4: { 
      fontWeight: 700,
      fontSize: { xs: '1.75rem', md: '2.125rem' }
    },
    h5: { 
      fontWeight: 600,
      fontSize: { xs: '1.5rem', md: '1.75rem' }
    },
    h6: { 
      fontWeight: 600,
      fontSize: { xs: '1.25rem', md: '1.5rem' }
    },
    button: { 
      fontWeight: 600, 
      textTransform: 'none',
      fontSize: { xs: '0.875rem', md: '0.9375rem' }
    },
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
          padding: { xs: '8px 16px', md: '10px 24px' },
          fontWeight: 600,
          fontSize: { xs: '0.875rem', md: '0.9375rem' }
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: { xs: 16, sm: 24 },
          paddingRight: { xs: 16, sm: 24 }
        }
      }
    }
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
          sx={{ 
            cursor: 'pointer', 
            borderColor: '#4CAF50',
            '& .MuiChip-label': { 
              display: { xs: 'none', sm: 'block' } 
            }
          }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ 
          sx: { 
            mt: 1.5, 
            borderRadius: 3,
            minWidth: 200 
          } 
        }}
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
const AuthButtons = ({ onAuthAction }) => {
  const { user } = useAuth();

  const handleGetStarted = () => {
    if (onAuthAction) {
      onAuthAction('register');
    }
  };

  const handleLogin = () => {
    if (onAuthAction) {
      onAuthAction('login');
    }
  };

  if (user) return <UserMenu />;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Button
        onClick={handleLogin}
        variant="text"
        sx={{ 
          color: 'white',
          fontWeight: 600
        }}
      >
        Login
      </Button>
      <Button
        onClick={handleGetStarted}
        variant="contained"
        sx={{ 
          backgroundColor: 'white', 
          color: '#2E7D32',
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        Get Started
      </Button>
    </Box>
  );
};

// Mobile Navigation Drawer
const MobileDrawer = ({ open, onClose, onAuthAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Progress', icon: <Analytics />, path: '/progress' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 280,
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          color: 'white'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Mosque sx={{ fontSize: 32, mr: 2 }} />
          <Typography variant="h6" fontWeight="700">
            Muslim<span style={{ color: '#FF9800' }}>Daily</span>
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <Close />
        </IconButton>
      </Box>

      <List sx={{ mt: 2 }}>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              margin: '4px 8px',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItem>
        ))}
      </List>

      {!user && (
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onAuthAction('register');
              onClose();
            }}
            sx={{
              backgroundColor: 'white',
              color: '#2E7D32',
              mb: 1,
              '&:hover': {
                backgroundColor: '#f5f5f5'
              }
            }}
          >
            Get Started
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              onAuthAction('login');
              onClose();
            }}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            Login
          </Button>
        </Box>
      )}
    </Drawer>
  );
};

// Mobile Bottom Navigation
const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Progress', icon: <Analytics />, path: '/progress' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Paper sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16
    }} elevation={8}>
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
          '& .MuiBottomNavigationAction-root': {
            color: 'rgba(255, 255, 255, 0.7)',
            minWidth: 'auto',
            padding: '8px 12px'
          },
          '& .Mui-selected': {
            color: 'white',
          }
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            sx={{
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                fontWeight: location.pathname === item.path ? 600 : 400,
                mt: 0.5
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
};

// Modern Header Component
const Header = ({ onAuthAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigationItems = [
    { label: 'Home', path: '/' },
    { label: 'Progress', path: '/progress' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <AppBar 
        position="sticky" 
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setDrawerOpen(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                flexGrow: 1, 
                cursor: 'pointer' 
              }} 
              onClick={() => navigate('/')}
            >
              <Mosque sx={{ fontSize: { xs: 28, md: 32 }, mr: 2 }} />
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
                    color: location.pathname === item.path ? '#FF9800' : 'white',
                    borderBottom: location.pathname === item.path ? '2px solid #FF9800' : 'none',
                    borderRadius: 0,
                    fontSize: '1rem'
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Auth Controls */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <AuthButtons onAuthAction={onAuthAction} />
            </Box>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <AuthButtons onAuthAction={onAuthAction} />
            </Box>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileDrawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        onAuthAction={onAuthAction}
      />
    </>
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
        right: { xs: 16, md: 24 },
        left: { xs: 16, md: 'auto' },
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(46, 125, 50, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center'
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleAuthAction = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

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
              <Header onAuthAction={handleAuthAction} />
              
              <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
                <Routes>
                  <Route path="/" element={<Home onAuthAction={handleAuthAction} />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Home onAuthAction={handleAuthAction} />} />
                </Routes>
              </Container>

              {/* Mobile Bottom Navigation */}
              <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                <MobileBottomNav />
              </Box>

              <PWAInstallPrompt />

              <AuthModal 
                open={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
              />
            </Box>
          </Router>
        </PracticeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;