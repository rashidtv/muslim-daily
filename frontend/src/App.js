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
  useMediaQuery,
  Badge
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
  Close,
  Notifications,
  Explore,
  Book,
  Psychology
} from '@mui/icons-material';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PracticeProvider } from './context/PracticeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Home from './pages/Home';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import AuthModal from './components/Auth/AuthModal';

// Unique modern theme - Sophisticated purple/amber scheme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366F1',
      light: '#818CF8',
      dark: '#4F46E5',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',
      secondary: '#6B7280',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
    }
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", sans-serif',
    h4: { 
      fontWeight: 800,
      fontSize: { xs: '1.75rem', md: '2.125rem' },
      background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h5: { 
      fontWeight: 700,
      fontSize: { xs: '1.5rem', md: '1.75rem' },
    },
    h6: { 
      fontWeight: 600,
      fontSize: { xs: '1.25rem', md: '1.5rem' },
    },
    button: { 
      fontWeight: 600, 
      textTransform: 'none',
      fontSize: { xs: '0.875rem', md: '0.9375rem' }
    },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid #F3F4F6',
          borderRadius: 20,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'visible',
          '&:hover': {
            boxShadow: '0 8px 40px rgba(99, 102, 241, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: { xs: '10px 20px', md: '12px 28px' },
          fontWeight: 600,
          fontSize: { xs: '0.875rem', md: '0.9375rem' },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            transition: 'left 0.5s',
          },
          '&:hover::before': {
            left: '100%',
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
          boxShadow: '0 4px 20px rgba(99, 102, 241, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(99, 102, 241, 0.4)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          border: '2px solid',
          borderColor: '#E5E7EB',
          '&:hover': {
            borderColor: '#6366F1',
            backgroundColor: 'rgba(99, 102, 241, 0.04)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
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
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          variant="dot"
          sx={{
            '& .MuiBadge-dot': {
              backgroundColor: '#10B981',
              width: 12,
              height: 12,
              borderRadius: '50%',
              border: '2px solid white'
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
              cursor: 'pointer',
              fontWeight: 600
            }}
            onClick={handleMenu}
          >
            {user.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Badge>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ 
          sx: { 
            mt: 1.5, 
            borderRadius: 3,
            minWidth: 200,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
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
          <Analytics sx={{ mr: 2, color: '#6366F1' }} />
          My Progress
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <SettingsIcon sx={{ mr: 2, color: '#6366F1' }} />
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#EF4444' }}>
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
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <Button
        onClick={handleLogin}
        variant="text"
        sx={{ 
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        Sign In
      </Button>
      <Button
        onClick={handleGetStarted}
        variant="contained"
        sx={{ 
          background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
          '&:hover': {
            transform: 'translateY(-2px)',
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
    { label: 'Explore', icon: <Explore />, path: '/explore' },
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
          width: 300,
          background: 'linear-gradient(135deg, #FAFAFA 0%, #FFFFFF 100%)',
          borderRight: '1px solid #F3F4F6'
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2
            }}
          >
            <Mosque sx={{ fontSize: 24, color: 'white' }} />
          </Box>
          <Typography variant="h6" fontWeight="800">
            Soul<span style={{ color: '#F59E0B' }}>Space</span>
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ 
            color: 'text.primary',
            background: 'rgba(99, 102, 241, 0.1)'
          }}
        >
          <Close />
        </IconButton>
      </Box>

      <List sx={{ mt: 2, px: 2 }}>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              background: location.pathname === item.path ? 
                'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'transparent',
              border: location.pathname === item.path ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
              margin: '8px 0',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.1)',
                transform: 'translateX(4px)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? '#6366F1' : 'text.secondary',
              minWidth: 40 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ 
                fontWeight: 600,
                color: location.pathname === item.path ? '#6366F1' : 'text.primary'
              }}
            />
          </ListItem>
        ))}
      </List>

      {!user && (
        <Box sx={{ p: 3, mt: 'auto' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onAuthAction('register');
              onClose();
            }}
            sx={{
              background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
              mb: 2,
              borderRadius: 3,
              py: 1.5
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
              borderRadius: 3,
              py: 1.5
            }}
          >
            Sign In
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

  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Progress', icon: <Analytics />, path: '/progress' },
    { label: 'Explore', icon: <Explore />, path: '/explore' },
    { label: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  return (
    <Paper sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      borderRadius: '20px 20px 0 0',
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.2)'
    }} elevation={8}>
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        sx={{
          background: 'transparent',
          height: 70,
          '& .MuiBottomNavigationAction-root': {
            color: '#9CA3AF',
            minWidth: 'auto',
            padding: '8px 12px',
            transition: 'all 0.3s ease',
          },
          '& .Mui-selected': {
            color: '#6366F1',
            transform: 'translateY(-2px)',
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
                fontWeight: location.pathname === item.path ? 700 : 500,
                mt: 0.5,
                transition: 'all 0.3s ease',
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
    { label: 'Explore', path: '/explore' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <>
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: { xs: 70, md: 80 } }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                sx={{ 
                  mr: 2,
                  color: 'text.primary',
                  background: 'rgba(99, 102, 241, 0.1)'
                }}
                onClick={() => setDrawerOpen(true)}
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
              <Box
                sx={{
                  width: { xs: 36, md: 44 },
                  height: { xs: 36, md: 44 },
                  background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 2
                }}
              >
                <Mosque sx={{ fontSize: { xs: 20, md: 24 }, color: 'white' }} />
              </Box>
              <Typography variant="h5" component="div" fontWeight="800">
                Soul<span style={{ color: '#F59E0B' }}>Space</span>
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, mr: 4 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={{
                    fontWeight: 600,
                    color: location.pathname === item.path ? '#6366F1' : 'text.primary',
                    background: location.pathname === item.path ? 
                      'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)' : 'transparent',
                    borderRadius: 3,
                    px: 3,
                    py: 1,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.05)',
                      transform: 'translateY(-1px)'
                    }
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
        bottom: { xs: 80, md: 24 },
        right: { xs: 16, md: 24 },
        left: { xs: 16, md: 'auto' },
        background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
        color: 'white',
        padding: '16px 24px',
        borderRadius: 16,
        cursor: 'pointer',
        boxShadow: '0 8px 40px rgba(99, 102, 241, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: '14px',
        fontWeight: '600',
        textAlign: 'center',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 50px rgba(99, 102, 241, 0.4)',
        }
      }}
      onClick={installApp}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography sx={{ fontSize: '18px' }}>📱</Typography>
      </Box>
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
              background: 'linear-gradient(135deg, #FAFAFA 0%, #F3F4F6 100%)',
              pb: { xs: 7, md: 0 },
            }}>
              <Header onAuthAction={handleAuthAction} />
              
              <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
                <Routes>
                  <Route path="/" element={<Home onAuthAction={handleAuthAction} />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/explore" element={<div>Explore Page</div>} />
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