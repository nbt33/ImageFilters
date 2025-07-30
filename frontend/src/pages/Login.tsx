import React, { useState } from 'react';
import { login } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  Container,
  Fade,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email, LoginRounded } from '@mui/icons-material';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🚀 Starting login for:', email);
      await login(email, password);

      console.log('✅ Login successful, navigating to filters');
      navigate('/filters');

    } catch (e: any) {
      console.error('❌ Login error:', e);

      // Более детальная обработка ошибок
      if (e.response?.data?.detail) {
        if (typeof e.response.data.detail === 'string') {
          if (e.response.data.detail.includes('Invalid')) {
            setError('Неверный email или пароль');
          } else {
            setError(`Ошибка входа: ${e.response.data.detail}`);
          }
        } else if (Array.isArray(e.response.data.detail)) {
          // Обработка ошибок валидации от pydantic
          const validationErrors = e.response.data.detail.map((err: any) => err.msg).join(', ');
          setError(`Ошибка валидации: ${validationErrors}`);
        } else {
          setError('Ошибка входа');
        }
      } else if (e.response?.status === 401) {
        setError('Неверный email или пароль');
      } else if (e.response?.status === 422) {
        setError('Проверьте правильность введенных данных');
      } else if (e.response?.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже');
      } else if (e.message) {
        setError(`Ошибка сети: ${e.message}`);
      } else {
        setError('Неизвестная ошибка входа');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Container maxWidth="sm" sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Fade in timeout={800}>
        <Card sx={{
          width: '100%',
          maxWidth: 400,
          backdropFilter: 'blur(20px)',
          background: 'rgba(30, 30, 46, 0.9)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.6)',
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Заголовок */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mb: 2,
                boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)'
              }}>
                <LoginRounded sx={{ fontSize: 40, color: 'white' }} />
              </Box>

              <Typography variant="h4" sx={{
                mb: 1,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                Добро пожаловать!
              </Typography>

              <Typography variant="body1" sx={{
                color: 'text.secondary',
                opacity: 0.8
              }}>
                Войдите в свой аккаунт для продолжения
              </Typography>
            </Box>

            {/* Ошибка */}
            {error && (
              <Fade in>
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    '& .MuiAlert-message': {
                      color: '#fca5a5'
                    }
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            {/* Форма */}
            <Box component="form" onKeyPress={handleKeyPress}>
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 15, 35, 0.6)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    }
                  }
                }}
              />

              <TextField
                label="Пароль"
                fullWidth
                margin="normal"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(15, 15, 35, 0.6)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(15, 15, 35, 0.8)',
                    }
                  }
                }}
              />

              <Button
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                fullWidth
                size="large"
                sx={{
                  py: 1.5,
                  mb: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  background: loading
                    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.4)',
                  },
                  '&:disabled': {
                    background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                    transform: 'none',
                  }
                }}
              >
                {loading ? 'Вход...' : 'Войти'}
              </Button>

              {/* Разделитель */}
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                '&::before, &::after': {
                  content: '""',
                  flex: 1,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent)'
                }
              }}>
                <Typography variant="body2" sx={{
                  px: 2,
                  color: 'text.secondary',
                  fontSize: '0.85rem'
                }}>
                  Нет аккаунта?
                </Typography>
              </Box>

              {/* Ссылка на регистрацию */}
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                fullWidth
                size="large"
                sx={{
                  py: 1.2,
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: 'primary.light',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.6)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                Создать аккаунт
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default Login;