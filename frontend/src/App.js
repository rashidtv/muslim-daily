import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PracticeProvider } from './context/PracticeContext';
import { AuthProvider } from './context/AuthContext'; // ← ADD THIS LINE

// Components
import Home from './pages/Home';
import Progress from './pages/Progress';
import Settings from './pages/Settings';
import AuthModal from './components/Auth/AuthModal'; // ← ADD THIS LINE

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
      light: '#757de8',
      dark: '#002984',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

// PWA Install Prompt Component
const PWAInstallPrompt = () => {
  const { isInstallable, installApp } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: 'linear-gradient(135deg, #3f51b5 0%, #2196f3 100%)',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '25px',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(63, 81, 181, 0.3)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'all 0.3s ease',
        border: '2px solid white',
      }}
      onClick={installApp}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-2px)';
        e.target.style.boxShadow = '0 6px 25px rgba(63, 81, 181, 0.4)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0)';
        e.target.style.boxShadow = '0 4px 20px rgba(63, 81, 181, 0.3)';
      }}
    >
      <span style={{ fontSize: '18px' }}>📱</span>
      Install App
    </div>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider> {/* ← ADD THIS WRAPPER */}
        <PracticeProvider>
          <Router>
            <div className="App" style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
              {/* Main App Content */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Fallback route */}
                <Route path="*" element={<Home />} />
              </Routes>

              {/* Auth Modal - Will auto-show when no user */} {/* ← ADD THIS LINE */}
              <AuthModal />
              
              {/* PWA Install Prompt */}
              <PWAInstallPrompt />
            </div>
          </Router>
        </PracticeProvider>
      </AuthProvider> {/* ← ADD THIS CLOSING TAG */}
    </ThemeProvider>
  );
}

export default App;