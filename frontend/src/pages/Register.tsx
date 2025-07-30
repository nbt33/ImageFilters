import React, { useState } from 'react';
import { register } from '../api';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Box,
  Alert,
  Typography,
  Card,
  CardContent,
  Container,
  Fade,
  IconButton,
  InputAdornment,
  LinearProgress
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email, PersonAdd, CheckCircle } from '@mui/icons-material';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Валидация пароля в реальном времени
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 25;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'error';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const handleRegister = async () => {
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting registration for:', email);
      await register(email, password);

      setSuccess('Регистрация завершена! Переходим к входу...');

      // Небольшая задержка для показа сообщения об успехе
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (e: any) {
      console.error('❌ Registration error:', e);

      // Более детальная обработка ошибок
      if (e.response?.data?.detail) {
        if (typeof e.response.data.detail === 'string') {
          setError(`Ошибка регистрации: ${e.response.data.detail}`);
        } else if (Array.isArray(e.response.data.detail)) {
          // Обработка ошибок валидации от pydantic
          const validationErrors = e.response.data.detail.map((err: any) => err.msg).join(', ');
          setError(`Ошибка валидации: ${validationErrors}`);
        } else {
          setError('Ошибка регистрации');
        }
      } else if (e.response?.status === 400) {
        setError('Пользователь с таким email уже существует');
      } else if (e.response?.status === 422) {
        setError('Проверьте правильность введенных данных (email должен быть валидным, пароль - минимум 8 символов с буквой и цифрой)');
      } else if (e.response?.status >= 500) {
        setError('Ошибка сервера. Попробуйте позже');
      } else if (e.message) {
        setError(`Ошибка сети: ${e.message}`);
      } else {
        setError('Неизвестная ошибка регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRegister();
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
                background: success
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mb: 2,
                boxShadow: success
                  ? '0 8px 20px -4px rgba(16, 185, 129, 0.4)'
                  : '0 8px 20px -4px rgba(99, 102, 241, 0.4)',
                transition: 'all 0.3s ease'
              }}>
                {success ? (
                  <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
                ) : (
                  <PersonAdd sx={{ fontSize: 40, color: 'white' }} />
                )}
              </Box>

              <Typography variant="h4" sx={{
                mb: 1,
                background: success
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}>
                {success ? 'Успешно!' : 'Регистрация'}
              </Typography>

              <Typography variant="body1" sx={{
                color: 'text.secondary',
                opacity: 0.8
              }}>
                {success ? 'Аккаунт создан. Перенаправляем...' : 'Создайте новый аккаунт для начала работы'}
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

            {/* Успех */}
            {success && (
              <Fade in>
                <Alert
                  severity="success"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    '& .MuiAlert-message': {
                      color: '#86efac'
                    }
                  }}
                >
                  {success}
                </Alert>
              </Fade>
            )}

            {/* Форма */}
            {!success && (
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
                    mb: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(15, 15, 35, 0.6)',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(15, 15, 35, 0.8)',
                      }
                    }
                  }}
                />

                {/* Индикатор силы пароля */}
                {password && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
                      Сила пароля
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={passwordStrength}
                      color={getStrengthColor()}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                      Минимум 8 символов, буквы и цифры
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="contained"
                  onClick={handleRegister}
                  disabled={loading || passwordStrength < 75}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    mb: 3,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: loading || passwordStrength < 75
                      ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: passwordStrength >= 75 && !loading
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                      transform: passwordStrength >= 75 && !loading ? 'translateY(-2px)' : 'none',
                      boxShadow: passwordStrength >= 75 && !loading
                        ? '0 8px 20px -4px rgba(99, 102, 241, 0.4)'
                        : 'none',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                      transform: 'none',
                    }
                  }}
                >
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
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
                    Уже есть аккаунт?
                  </Typography>
                </Box>

                {/* Ссылка на вход */}
                <Button
                  component={Link}
                  to="/login"
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
                  Войти в существующий аккаунт
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default Register;