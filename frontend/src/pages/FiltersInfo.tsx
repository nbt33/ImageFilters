import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Fade,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Info,
  AutoFixHigh,
  Brush,
  Category,
  Speed,
  Psychology,
  Palette
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FiltersInfo: React.FC = () => {
  const navigate = useNavigate();

  const filters = [
    {
      name: 'Canny Edges',
      key: 'canny',
      icon: <AutoFixHigh />,
      category: 'Обнаружение краев',
      difficulty: 'Базовый',
      speed: 'Быстро',
      description: 'Классический алгоритм обнаружения краев. Выделяет контуры объектов на изображении, создавая черно-белое изображение с четкими границами.',
      useCase: 'Подготовка к дальнейшей обработке, анализ контуров, создание эскизов',
      color: 'primary'
    },
    {
      name: 'Stylize',
      key: 'stylize',
      icon: <Brush />,
      category: 'Художественная обработка',
      difficulty: 'Средний',
      speed: 'Средне',
      description: 'Стилизация изображения с применением художественных эффектов. Создает более живописный и выразительный вид.',
      useCase: 'Создание художественных работ, улучшение визуального восприятия',
      color: 'secondary'
    },
    {
      name: 'K-Means Segmentation',
      key: 'kmeans',
      icon: <Category />,
      category: 'Сегментация',
      difficulty: 'Продвинутый',
      speed: 'Средне',
      description: 'Алгоритм кластеризации, который группирует пиксели по цветовому сходству. Упрощает изображение, выделяя основные цветовые области.',
      useCase: 'Упрощение изображений, выделение объектов, подготовка к анализу',
      color: 'info'
    },
    {
      name: 'Voronoi Diagram',
      key: 'voronoi',
      icon: <Palette />,
      category: 'Геометрическая обработка',
      difficulty: 'Продвинутый',
      speed: 'Медленно',
      description: 'Создает диаграмму Вороного на основе ключевых точек изображения. Результат напоминает мозаику или витраж.',
      useCase: 'Художественные эффекты, создание абстрактных изображений',
      color: 'warning'
    },
    {
      name: 'Voronoi Colored',
      key: 'voronoi_colored',
      icon: <Palette />,
      category: 'Геометрическая обработка',
      difficulty: 'Продвинутый',
      speed: 'Медленно',
      description: 'Цветная версия диаграммы Вороного. Сохраняет исходные цвета изображения в геометрических ячейках.',
      useCase: 'Декоративные эффекты, создание уникальных паттернов',
      color: 'success'
    },
    {
      name: 'Adaptive Enhancement',
      key: 'adaptive_enhancement',
      icon: <AutoFixHigh />,
      category: 'Улучшение качества',
      difficulty: 'Средний',
      speed: 'Быстро',
      description: 'Адаптивное улучшение изображения с автоматической коррекцией яркости, контрастности и четкости.',
      useCase: 'Улучшение фотографий, коррекция экспозиции, повышение детализации',
      color: 'primary'
    },
    {
      name: 'Neural Flow',
      key: 'neural_flow',
      icon: <Psychology />,
      category: 'ИИ обработка',
      difficulty: 'Экспертный',
      speed: 'Медленно',
      description: 'Использует нейронные сети для создания плавных морфологических преобразований. Создает уникальные художественные эффекты.',
      useCase: 'Креативная обработка, создание необычных визуальных эффектов',
      color: 'secondary'
    },
    {
      name: 'Quantum Ripple',
      key: 'quantum_ripple',
      icon: <Speed />,
      category: 'Эффекты искажения',
      difficulty: 'Продвинутый',
      speed: 'Средне',
      description: 'Создает эффект квантовой ряби, имитирующий волновые искажения. Придает изображению футуристический вид.',
      useCase: 'Научная фантастика, футуристические дизайны, абстрактное искусство',
      color: 'info'
    },
    {
      name: 'Neon Dreams',
      key: 'neon_dreams',
      icon: <Brush />,
      category: 'Неоновые эффекты',
      difficulty: 'Средний',
      speed: 'Средне',
      description: 'Создает яркие неоновые эффекты с светящимися краями. Идеально для создания ретро-футуристического стиля.',
      useCase: 'Киберпанк дизайн, неоновая реклама, ночные сцены',
      color: 'warning'
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Базовый': return 'success';
      case 'Средний': return 'warning';
      case 'Продвинутый': return 'info';
      case 'Экспертный': return 'error';
      default: return 'default';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Быстро': return 'success';
      case 'Средне': return 'warning';
      case 'Медленно': return 'error';
      default: return 'default';
    }
  };

  return (
    <>
      {/* Заголовок страницы */}
      <AppBar
        position="sticky"
        sx={{
          background: 'rgba(30, 30, 46, 0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <Toolbar>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{ mr: 2, color: 'primary.light' }}
          >
            <ArrowBack />
          </IconButton>
          <Info sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Описание фильтров
          </Typography>
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
              Доступные фильтры
            </Typography>
            <Typography variant="h6" sx={{
              color: 'text.secondary',
              opacity: 0.8,
              maxWidth: 800,
              mx: 'auto'
            }}>
              Изучите все доступные фильтры и выберите подходящий для вашей задачи.
              От базовых алгоритмов до продвинутых нейронных сетей.
            </Typography>
          </Box>
        </Fade>

        {/* Статистика */}
        <Fade in timeout={800}>
          <Paper sx={{
            p: 3,
            mb: 4,
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 3
          }}>
            <Grid container spacing={3} sx={{ textAlign: 'center' }}>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: 'primary.main',
                  mb: 1
                }}>
                  {filters.length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Всего фильтров
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: 'success.main',
                  mb: 1
                }}>
                  {filters.filter(f => f.difficulty === 'Базовый').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Базовых
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: 'warning.main',
                  mb: 1
                }}>
                  {filters.filter(f => f.category.includes('ИИ')).length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  С ИИ
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="h4" sx={{
                  fontWeight: 700,
                  color: 'info.main',
                  mb: 1
                }}>
                  {filters.filter(f => f.speed === 'Быстро').length}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Быстрых
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Список фильтров */}
        <Grid container spacing={3}>
          {filters.map((filter, index) => (
            <Grid item xs={12} md={6} key={filter.key}>
              <Fade in timeout={800 + index * 100}>
                <Card sx={{
                  height: '100%',
                  background: 'rgba(30, 30, 46, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    boxShadow: '0 10px 20px -4px rgba(99, 102, 241, 0.3)',
                  }
                }}>
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Заголовок фильтра */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        mr: 2,
                        color: 'white'
                      }}>
                        {filter.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5
                        }}>
                          {filter.name}
                        </Typography>
                        <Typography variant="caption" sx={{
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          letterSpacing: 1
                        }}>
                          {filter.category}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Бейджи */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                      <Chip
                        label={filter.difficulty}
                        size="small"
                        color={getDifficultyColor(filter.difficulty)}
                        variant="outlined"
                      />
                      <Chip
                        label={filter.speed}
                        size="small"
                        color={getSpeedColor(filter.speed)}
                        variant="outlined"
                      />
                    </Box>

                    {/* Описание */}
                    <Typography variant="body2" sx={{
                      color: 'text.primary',
                      mb: 2,
                      lineHeight: 1.6,
                      flex: 1
                    }}>
                      {filter.description}
                    </Typography>

                    {/* Случаи использования */}
                    <Paper sx={{
                      p: 2,
                      background: 'rgba(99, 102, 241, 0.05)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      borderRadius: 2
                    }}>
                      <Typography variant="caption" sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: 1,
                        display: 'block',
                        mb: 1
                      }}>
                        Применение
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: 'text.secondary',
                        fontSize: '0.85rem'
                      }}>
                        {filter.useCase}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Дополнительная информация */}
        <Fade in timeout={1200}>
          <Paper sx={{
            p: 4,
            mt: 6,
            background: 'rgba(30, 30, 46, 0.6)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 3,
            textAlign: 'center'
          }}>
            <Typography variant="h5" sx={{
              mb: 2,
              fontWeight: 600,
              color: 'text.primary'
            }}>
              Нужна помощь с выбором?
            </Typography>
            <Typography variant="body1" sx={{
              color: 'text.secondary',
              mb: 3,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Если вы не уверены, какой фильтр выбрать, начните с базовых алгоритмов.
              Для художественных задач попробуйте Stylize или Neon Dreams.
              Для анализа изображений подойдут Canny или K-Means.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label="Для новичков: Canny, Adaptive Enhancement"
                color="success"
                variant="outlined"
              />
              <Chip
                label="Для творчества: Stylize, Neon Dreams"
                color="secondary"
                variant="outlined"
              />
              <Chip
                label="Для анализа: K-Means, Voronoi"
                color="info"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Fade>
      </Container>
    </>
  );
};

export default FiltersInfo;