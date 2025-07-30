import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Fade,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Logout,
  Person,
  PhotoLibrary,
  VideoLibrary,
  Layers,
  Info,
  Dashboard,
  Brush
} from '@mui/icons-material';
import UploadForm from '../components/UploadForm';
import ResultViewer from '../components/ResultViewer';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api';

const Filters: React.FC = () => {
  const [result, setResult] = useState<{ image: string; duration: number } | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      to: '/batch',
      icon: <PhotoLibrary />,
      title: 'Пакетная обработка',
      description: 'Обрабатывайте несколько изображений одновременно'
    },
    {
      to: '/video',
      icon: <VideoLibrary />,
      title: 'Обработка видео',
      description: 'Извлекайте и фильтруйте кадры из видео'
    },
    {
      to: '/mask',
      icon: <Layers />,
      title: 'Создание масок',
      description: 'Рисуйте маски для точечной обработки'
    },
    {
      to: '/filters-info',
      icon: <Info />,
      title: 'Описание фильтров',
      description: 'Узнайте подробнее о каждом фильтре'
    }
  ];

  return (
    <>
      {/* Верхняя панель */}
      <AppBar
        position="sticky"
        sx={{
          background: 'rgba(30, 30, 46, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
        }}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              mr: 2
            }}>
              <Brush sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Typography variant="h6" sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Image Filter Studio
            </Typography>
          </Box>

          <IconButton
            onClick={handleMenuOpen}
            sx={{
              p: 0,
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          >
            <Avatar sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36
            }}>
              <Person />
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                background: 'rgba(30, 30, 46, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                mt: 1
              }
            }}
          >
            <MenuItem onClick={handleLogout} sx={{ color: 'text.primary' }}>
              <Logout sx={{ mr: 1, fontSize: 20 }} />
              Выйти
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Заголовок */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" sx={{
              mb: 2,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Обработка изображений
            </Typography>
            <Typography variant="h6" sx={{
              color: 'text.secondary',
              opacity: 0.8,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Загрузите изображение и примените к нему один из доступных фильтров
            </Typography>
          </Box>
        </Fade>

        {/* Быстрые действия */}
        <Fade in timeout={800}>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {menuItems.map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={item.to}>
                <Card
                  component={Link}
                  to={item.to}
                  sx={{
                    height: '100%',
                    textDecoration: 'none',
                    background: 'rgba(30, 30, 46, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      border: '1px solid rgba(99, 102, 241, 0.4)',
                      boxShadow: '0 10px 20px -4px rgba(99, 102, 241, 0.3)',
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <Box sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      mb: 2,
                      color: 'white'
                    }}>
                      {item.icon}
                    </Box>
                    <Typography variant="h6" sx={{
                      mb: 1,
                      color: 'text.primary',
                      fontWeight: 600
                    }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" sx={{
                      color: 'text.secondary',
                      lineHeight: 1.4
                    }}>
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Fade>

        {/* Основная форма обработки */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Fade in timeout={1000}>
              <Card sx={{
                background: 'rgba(30, 30, 46, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                height: 'fit-content'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" sx={{
                    mb: 3,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}>
                    Обработать изображение
                  </Typography>

                  <UploadForm setResult={setResult} setOriginalImageUrl={setOriginalImageUrl} />

                  {originalImageUrl && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2, color: 'text.primary' }}>
                        Исходное изображение:
                      </Typography>
                      <Box sx={{
                        border: '2px solid rgba(99, 102, 241, 0.2)',
                        borderRadius: 2,
                        overflow: 'hidden',
                        '& img': {
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }
                      }}>
                        <img src={originalImageUrl} alt="Original" />
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={6}>
            <Fade in timeout={1200}>
              <Card sx={{
                background: 'rgba(30, 30, 46, 0.8)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                height: 'fit-content',
                minHeight: result ? 'auto' : 400,
                display: 'flex',
                alignItems: result ? 'flex-start' : 'center',
                justifyContent: result ? 'flex-start' : 'center'
              }}>
                <CardContent sx={{ p: 4, width: '100%' }}>
                  {result ? (
                    <>
                      <Typography variant="h5" sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: 'text.primary'
                      }}>
                        Результат обработки
                      </Typography>
                      <ResultViewer
                        imageBase64={result.image}
                        durationMs={result.duration}
                      />
                    </>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <Dashboard sx={{
                        fontSize: 80,
                        color: 'rgba(99, 102, 241, 0.3)',
                        mb: 2
                      }} />
                      <Typography variant="h6" sx={{
                        color: 'text.secondary',
                        mb: 1
                      }}>
                        Результат появится здесь
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        opacity: 0.7
                      }}>
                        Загрузите изображение и выберите фильтр
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Filters;