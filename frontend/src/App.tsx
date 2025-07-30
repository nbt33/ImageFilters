import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Register from './pages/Register';
import Login from './pages/Login';
import Filters from './pages/Filters';
import FiltersInfo from './pages/FiltersInfo';
import ProtectedRoute from './auth/ProtectedRoute';
import BatchPage from './pages/BatchPage';
import VideoPage from './pages/VideoPage';
import MaskPage from './pages/MaskPage';

// Кастомная тема Material-UI
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
    },
    secondary: {
      main: '#8b5cf6',
      dark: '#7c3aed',
      light: '#a78bfa',
    },
    background: {
      default: '#0f0f23',
      paper: 'rgba(30, 30, 46, 0.8)',
    },
    text: {
      primary: '#e2e8f0',
      secondary: '#94a3b8',
    },
    divider: 'rgba(99, 102, 241, 0.2)',
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 600,
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h4: {
      fontWeight: 600,
      color: '#e2e8f0',
    },
    h5: {
      fontWeight: 600,
      color: '#e2e8f0',
    },
    h6: {
      fontWeight: 500,
      color: '#e2e8f0',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
        contained: {
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
          }
        },
        outlined: {
          borderColor: 'rgba(99, 102, 241, 0.4)',
          color: '#818cf8',
          '&:hover': {
            borderColor: 'rgba(99, 102, 241, 0.6)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(30, 30, 46, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 12,
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
        }
      }
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          background: 'rgba(15, 15, 35, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        }
      }
    }
  }
});

// Компонент для красивого фона
const BackgroundDecorations: React.FC = () => (
  <Box
    sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      background: `
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)
      `,
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `
          linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.05) 50%, transparent 100%),
          linear-gradient(0deg, transparent 0%, rgba(139, 92, 246, 0.05) 50%, transparent 100%)
        `,
        backgroundSize: '100px 100px, 100px 100px',
        animation: 'float 20s ease-in-out infinite',
      }
    }}
  />
);

const App: React.FC = () => (
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <BackgroundDecorations />
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/filters" element={<ProtectedRoute><Filters /></ProtectedRoute>} />
        <Route path="/filters-info" element={<ProtectedRoute><FiltersInfo /></ProtectedRoute>} />
        <Route path="/batch" element={<ProtectedRoute><BatchPage /></ProtectedRoute>} />
        <Route path="/video" element={<ProtectedRoute><VideoPage /></ProtectedRoute>} />
        <Route path="/mask" element={<ProtectedRoute><MaskPage /></ProtectedRoute>} />
      </Routes>
    </Router>
  </ThemeProvider>
);

export default App;