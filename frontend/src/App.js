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
  Book,
  Schedule,
  TrendingUp,
  CalendarMonth,
  LocationOn
} from '@mui/icons-material';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PracticeProvider } from './context/PracticeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Home from './pages/Home';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import Calendar from './pages/Calendar';
import AuthModal from './components/Auth/AuthModal';

// Calming color scheme - Teal & Amber
const theme = createTheme({
  palette: {
    primary: {
      main: '#0D9488',
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    background: {
      default: '#F0FDFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { 
      fontWeight: 700,
      fontSize: { xs: '1.5rem', md: '2rem' },
    },
    h5: { 
      fontWeight: 600,
      fontSize: { xs: '1.25rem', md: '1.5rem' },
    },
    h6: { 
      fontWeight: 600,
      fontSize: { xs: '1.1rem', md: '1.25rem' },
    },
    body1: {
      fontSize: { xs: '0.875rem', md: '1rem' },
    },
    button: { 
      fontWeight: 600, 
      textTransform: 'none',
      fontSize: { xs: '0.8rem', md: '0.9rem' }
    },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(13, 148, 136, 0.08)',
          border: '1px solid #E2E8F0',
          borderRadius: 16,
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(13, 148, 136, 0.12)',
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
          fontSize: { xs: '0.8rem', md: '0.9rem' },
        },
        contained: {
          backgroundColor: '#0D9488',
          '&:hover': {
            backgroundColor: '#0F766E',
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: { xs: '16px', sm: '24px' },
          paddingRight: { xs: '16px', sm: '24px' }
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
              width: 10,
              height: 10,
              borderRadius: '50%',
              border: '2px solid white'
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36, 
              background: 'linear-gradient(135deg, #0D9488 0%, #F59E0B 100%)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem'
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
            mt: 1, 
            borderRadius: 2,
            minWidth: 180,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          } 
        }}
      >
        <MenuItem sx={{ cursor: 'default', opacity: 1 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight="600">{user.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/progress')}>
          <Analytics sx={{ mr: 2, fontSize: '1.2rem', color: '#0D9488' }} />
          <Typography variant="body2">My Progress</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/calendar')}>
          <CalendarMonth sx={{ mr: 2, fontSize: '1.2rem', color: '#0D9488' }} />
          <Typography variant="body2">My Calendar</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleNavigate('/settings')}>
          <SettingsIcon sx={{ mr: 2, fontSize: '1.2rem', color: '#0D9488' }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#DC2626' }}>
          <Logout sx={{ mr: 2, fontSize: '1.2rem' }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </div>
  );
};

// Auth Buttons Component
const AuthButtons = ({ onAuthAction }) => {
  const { user } = useAuth();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
          color: 'text.primary',
          fontWeight: 600
        }}
      >
        Sign In
      </Button>
      <Button
        onClick={handleGetStarted}
        variant="contained"
        size={isMobile ? "small" : "medium"}
        sx={{ 
          backgroundColor: '#0D9488',
          '&:hover': {
            backgroundColor: '#0F766E',
          }
        }}
      >
        {isMobile ? 'Start' : 'Get Started'}
      </Button>
    </Box>
  );
};

// Mobile Navigation Drawer
const MobileNavigationDrawer = ({ open, onClose, onAuthAction }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navigationItems = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Prayer Times', icon: <Schedule />, path: '/prayers' },
    { label: 'My Calendar', icon: <CalendarMonth />, path: '/calendar' },
    { label: 'Progress', icon: <Analytics />, path: '/progress' },
    { label: 'Mosque Finder', icon: <LocationOn />, path: '/mosques' },
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
          backgroundColor: 'background.paper'
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
              border: '1px solid rgba(13, 148, 136, 0.2)'
            }}
          >
            <Book sx={{ fontSize: 18, color: '#0D9488' }} />
          </Box>
          <Typography variant="h6" fontWeight="700">
            Muslim<span style={{ color: '#F59E0B' }}>Diary</span>
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </Box>

      <List sx={{ mt: 1, px: 1 }}>
        {navigationItems.map((item) => (
          <ListItem 
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            sx={{
              cursor: 'pointer',
              backgroundColor: location.pathname === item.path ? 'rgba(13, 148, 136, 0.08)' : 'transparent',
              margin: '4px 0',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(13, 148, 136, 0.04)'
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? '#0D9488' : 'text.secondary',
              minWidth: 40 
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              primaryTypographyProps={{ 
                fontWeight: location.pathname === item.path ? 600 : 400,
                fontSize: '0.9rem'
              }}
            />
          </ListItem>
        ))}
      </List>

      {!user && (
        <Box sx={{ p: 2, mt: 'auto', borderTop: '1px solid #E2E8F0' }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              onAuthAction('register');
              onClose();
            }}
            sx={{
              backgroundColor: '#0D9488',
              mb: 1,
              borderRadius: 2,
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
              borderRadius: 2,
              borderColor: '#E2E8F0',
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
    { label: 'Prayers', icon: <Schedule />, path: '/prayers' },
    { label: 'Calendar', icon: <CalendarMonth />, path: '/calendar' },
    { label: 'Progress', icon: <TrendingUp />, path: '/progress' },
  ];

  return (
    <Paper sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000,
      borderTop: '1px solid #E2E8F0',
    }} elevation={3}>
      <BottomNavigation
        value={location.pathname}
        onChange={(event, newValue) => navigate(newValue)}
        showLabels
        sx={{
          backgroundColor: 'background.paper',
          height: '65px'
        }}
      >
        {navigationItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            value={item.path}
            icon={item.icon}
            sx={{
              color: location.pathname === item.path ? '#0D9488' : '#64748B',
              minWidth: '60px',
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
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
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar sx={{ minHeight: { xs: '60px', md: '68px' }, py: 1 }}>
          <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                edge="start"
                sx={{ mr: 1 }}
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
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  backgroundColor: 'rgba(13, 148, 136, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                  border: '1px solid rgba(13, 148, 136, 0.2)'
                }}
              >
                <Book sx={{ fontSize: { xs: 18, md: 20 }, color: '#0D9488' }} />
              </Box>
              <Typography variant="h6" component="div" fontWeight="700">
                Muslim<span style={{ color: '#F59E0B' }}>Diary</span>
              </Typography>
            </Box>

            {/* Auth Controls */}
            <AuthButtons onAuthAction={onAuthAction} />
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <MobileNavigationDrawer 
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
        bottom: { xs: 72, md: 24 },
        right: { xs: 16, md: 24 },
        left: { xs: 16, md: 'auto' },
        backgroundColor: '#0D9488',
        color: 'white',
        padding: '12px 16px',
        borderRadius: 12,
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(13, 148, 136, 0.3)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        fontSize: '0.8rem',
        fontWeight: '600',
        textAlign: 'center'
      }}
      onClick={installApp}
    >
      <Box
        sx={{
          width: 24,
          height: 24,
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography sx={{ fontSize: '14px' }}>📱</Typography>
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
              backgroundColor: 'background.default',
              pb: { xs: '65px', md: 0 },
            }}>
              <Header onAuthAction={handleAuthAction} />
              
              <Container 
                maxWidth="lg" 
                sx={{ 
                  py: { xs: 2, md: 3 },
                  px: { xs: 2, sm: 3 } 
                }}
              >
                <Routes>
                  <Route path="/" element={<Home onAuthAction={handleAuthAction} />} />
                  <Route path="/progress" element={<Progress />} />
                  <Route path="/prayers" element={<PrayerTimesComingSoon />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/mosques" element={<MosqueFinderComingSoon />} />
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

// Simple Coming Soon Components
const PrayerTimesComingSoon = () => (
  <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
    <Typography variant="h4" fontWeight="700" gutterBottom>
      Prayer Times
    </Typography>
    <Typography variant="h6" color="text.secondary">
      Coming Soon
    </Typography>
  </Container>
);

const MosqueFinderComingSoon = () => (
  <Container maxWidth="lg" sx={{ py: 3, textAlign: 'center' }}>
    <Typography variant="h4" fontWeight="700" gutterBottom>
      Mosque Finder
    </Typography>
    <Typography variant="h6" color="text.secondary">
      Coming Soon
    </Typography>
  </Container>
);

export default App;