import React, { useState } from 'react';
import { sendVideo, sendVideoZip } from '../api';
import { FilterType } from '../types';
import {
  Box,
  Button,
  Select,
  MenuItem,
  Typography,
  Grid,
  CircularProgress,
  Container,
  Card,
  CardContent,
  Paper,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  LinearProgress,
  Fade
} from '@mui/material';
import { 
  ArrowBack, 
  VideoLibrary, 
  CloudUpload, 
  Download,
  PlayArrow,
  Archive,
  Timer,
  Movie
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const VideoPage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<FilterType>('canny');
  const [frames, setFrames] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const filterOptions = [
    { value: 'none', label: 'Без фильтра (оригинал)' },
    { value: 'canny', label: 'Canny Edges' },
    { value: 'stylize', label: 'Stylize' },
    { value: 'kmeans', label: 'KMeans Segmentation' },
    { value: 'voronoi', label: 'Voronoi Diagram' },
    { value: 'voronoi_colored', label: 'Voronoi (Colored)' },
    { value: 'neural_flow', label: 'Neural Flow' },
    { value: 'adaptive_enhancement', label: 'Adaptive Enhancement' },
    { value: 'quantum_ripple', label: 'Quantum Ripple' },
    { value: 'neon_dreams', label: 'Neon Dreams' },
  ];

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(0);
    
    try {
      // Симуляция прогресса
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 300);

      const framesData = await sendVideo(file, filter);
      setFrames(framesData.map(b64 => `data:image/png;base64,${b64}`));
      
      clearInterval(interval);
      setProgress(100);
    } catch (e) {
      console.error(e);
      alert('Ошибка при обработке видео');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!file) return;
    try {
      const zipBlob = await sendVideoZip(file, filter);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_frames_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Ошибка при скачивании ZIP", e);
      alert("Ошибка при скачивании ZIP-файла");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.src = URL.createObjectURL(file);
    });
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
          <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Обработка видео файлов
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Основная карточка */}
        <Card sx={{ 
          background: 'rgba(30, 30, 46, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ 
                mb: 2,
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Извлечение кадров из видео
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}>
                Загрузите видео файл, и мы извлечём значимые кадры и применим к ним выбранный фильтр
              </Typography>
            </Box>

            {/* Зона загрузки видео */}
            <Paper
              sx={{
                border: file 
                  ? '2px solid rgba(34, 197, 94, 0.6)'
                  : '2px dashed rgba(99, 102, 241, 0.3)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                background: file 
                  ? 'rgba(34, 197, 94, 0.05)'
                  : 'rgba(30, 30, 46, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                mb: 3,
                '&:hover': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.05)',
                }
              }}
              onClick={() => document.getElementById('video-file-input')?.click()}
            >
              <input
                id="video-file-input"
                type="file"
                accept="video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                style={{ display: 'none' }}
              />

              <Movie sx={{ 
                fontSize: 64, 
                color: file ? 'success.main' : 'primary.main',
                mb: 2
              }} />

              <Typography variant="h6" sx={{ 
                mb: 1,
                color: file ? 'success.main' : 'text.primary',
                fontWeight: 600
              }}>
                {file ? 'Видео загружено!' : 'Загрузите видео файл'}
              </Typography>

              <Typography variant="body2" sx={{ 
                color: 'text.secondary',
                mb: 2
              }}>
                {file 
                  ? `${file.name} (${formatFileSize(file.size)})`
                  : 'Поддерживаемые форматы: MP4, AVI, MOV, MKV и другие'
                }
              </Typography>

              {file && (
                <Chip 
                  label="Изменить файл" 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                />
              )}
            </Paper>

            {/* Выбор фильтра */}
            <Select
              fullWidth
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              sx={{
                mb: 3,
                backgroundColor: 'rgba(15, 15, 35, 0.6)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(99, 102, 241, 0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                }
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    background: 'rgba(30, 30, 46, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                  },
                },
              }}
            >
              {filterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            {/* Прогресс обработки */}
            {loading && (
              <Fade in>
                <Paper sx={{ 
                  p: 3, 
                  mb: 3,
                  background: 'rgba(99, 102, 241, 0.05)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Извлечение и обработка кадров... {Math.round(progress)}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      }
                    }}
                  />
                </Paper>
              </Fade>
            )}

            {/* Кнопки действий */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !file}
                startIcon={loading ? <CircularProgress size={20} /> : <PlayArrow />}
                sx={{ 
                  flex: 1,
                  minWidth: 200,
                  py: 1.5,
                  background: loading || !file
                    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: !loading && file
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                  }
                }}
              >
                {loading ? 'Обработка...' : 'Обработать видео'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleDownloadZip}
                disabled={!file}
                startIcon={<Archive />}
                sx={{ 
                  flex: 1,
                  minWidth: 200,
                  py: 1.5,
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: 'primary.light',
                  '&:hover': {
                    borderColor: 'rgba(99, 102, 241, 0.6)',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }
                }}
              >
                Скачать ZIP архив
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Результаты - извлеченные кадры */}
        {frames.length > 0 && (
          <Fade in timeout={800}>
            <Card sx={{ 
              background: 'rgba(30, 30, 46, 0.8)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3 
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    color: 'text.primary'
                  }}>
                    Извлеченные кадры
                  </Typography>
                  
                  <Chip 
                    icon={<Timer />}
                    label={`Кадров: ${frames.length}`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Box>

                <Typography variant="body2" sx={{ 
                  color: 'text.secondary',
                  mb: 3
                }}>
                  Показаны наиболее значимые кадры из видео с примененным фильтром
                </Typography>

                <Grid container spacing={3}>
                  {frames.map((img, idx) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                      <Paper sx={{ 
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px solid rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 20px -4px rgba(99, 102, 241, 0.3)',
                        }
                      }}>
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={img}
                            alt={`frame-${idx}`}
                            style={{ 
                              width: '100%', 
                              height: 150, 
                              objectFit: 'cover',
                              display: 'block'
                            }}
                          />
                          <Box sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            opacity: 0,
                            transition: 'opacity 0.2s ease',
                            '.MuiPaper-root:hover &': {
                              opacity: 1
                            }
                          }}>
                            <IconButton 
                              size="small"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = img;
                                link.download = `frame_${idx + 1}.png`;
                                link.click();
                              }}
                              sx={{ 
                                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                }
                              }}
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ 
                            color: 'text.secondary',
                            textAlign: 'center'
                          }}>
                            Кадр {idx + 1}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Fade>
        )}
      </Container>
    </>
  );
};

export default VideoPage;