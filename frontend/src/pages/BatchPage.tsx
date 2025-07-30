import React, { useState } from 'react';
import { sendBatchImagesInline, sendBatchImages } from '../api';
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
  IconButton,
  Tooltip,
  LinearProgress,
  Fade,
  AppBar,
  Toolbar
} from '@mui/material';
import { 
  ArrowBack, 
  CloudUpload, 
  Download, 
  ViewModule, 
  Archive,
  PhotoLibrary,
  Timer,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BatchPage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [filter, setFilter] = useState<FilterType>('canny');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [errors, setErrors] = useState<number>(0);
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
    if (files.length === 0) return;
    setLoading(true);
    setProgress(0);
    setErrors(0);
    
    try {
      // Симуляция прогресса
      const interval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const base64Images = await sendBatchImagesInline(files, filter);
      const validImages = base64Images.filter(
        (img): img is string => typeof img === 'string' && img.length > 0
      );
      
      setResults(validImages.map(b64 => `data:image/png;base64,${b64}`));
      setErrors(files.length - validImages.length);
      
      clearInterval(interval);
      setProgress(100);
    } catch (e) {
      console.error("Ошибка при пакетной обработке", e);
      alert("Ошибка при обработке изображений");
      setErrors(files.length);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const zipBlob = await sendBatchImages(files, filter);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `filtered_images_${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Ошибка при скачивании архива", e);
      alert("Ошибка при скачивании ZIP-файла");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith('image/')
    );
    setFiles(prev => [...prev, ...newFiles]);
    setResults([]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setResults([]);
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
          <PhotoLibrary sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ 
            fontWeight: 600,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Пакетная обработка изображений
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
                Обработайте несколько изображений
              </Typography>
              <Typography variant="body1" sx={{ 
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto'
              }}>
                Загрузите множество изображений и примените к ним один фильтр. Результат можно просмотреть или скачать архивом.
              </Typography>
            </Box>

            {/* Зона загрузки */}
            <Paper
              sx={{
                border: '2px dashed rgba(99, 102, 241, 0.3)',
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                background: 'rgba(30, 30, 46, 0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                mb: 3,
                '&:hover': {
                  borderColor: 'rgba(99, 102, 241, 0.5)',
                  background: 'rgba(99, 102, 241, 0.05)',
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('batch-file-input')?.click()}
            >
              <input
                id="batch-file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files ?? []);
                  setFiles(prev => [...prev, ...newFiles]);
                  setResults([]);
                }}
                style={{ display: 'none' }}
              />

              <CloudUpload sx={{
                fontSize: 64,
                color: 'primary.main',
                mb: 2
              }} />

              <Typography variant="h6" sx={{
                mb: 1,
                color: 'text.primary',
                fontWeight: 600
              }}>
                {files.length > 0 ? `Загружено ${files.length} файлов` : 'Загрузите изображения'}
              </Typography>

              <Typography variant="body2" sx={{
                color: 'text.secondary',
                mb: 2
              }}>
                Перетащите файлы сюда или нажмите для выбора (поддерживается множественный выбор)
              </Typography>

              {files.length === 0 && (
                <Chip
                  label="Выбрать файлы"
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }}
                />
              )}
            </Paper>

            {/* Список загруженных файлов */}
            {files.length > 0 && (
              <Fade in>
                <Paper sx={{
                  p: 3,
                  mb: 3,
                  background: 'rgba(15, 15, 35, 0.6)',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: 2,
                  maxHeight: 200,
                  overflow: 'auto'
                }}>
                  <Typography variant="subtitle1" sx={{
                    mb: 2,
                    color: 'text.primary',
                    fontWeight: 600
                  }}>
                    Загруженные файлы ({files.length})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {files.map((file, index) => (
                      <Chip
                        key={index}
                        label={`${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`}
                        onDelete={() => removeFile(index)}
                        variant="outlined"
                        size="small"
                        sx={{
                          maxWidth: 250,
                          '& .MuiChip-label': {
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </Fade>
            )}

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
                      Обработка изображений... {Math.round(progress)}%
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
                disabled={loading || files.length === 0}
                startIcon={loading ? <CircularProgress size={20} /> : <ViewModule />}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  py: 1.5,
                  background: loading || files.length === 0
                    ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: !loading && files.length > 0
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                  }
                }}
              >
                {loading ? 'Обработка...' : 'Обработать и показать'}
              </Button>

              <Button
                variant="outlined"
                onClick={handleDownloadZip}
                disabled={files.length === 0}
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

        {/* Результаты */}
        {(results.length > 0 || errors > 0) && (
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
                    Результаты обработки
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {results.length > 0 && (
                      <Chip
                        icon={<CheckCircle />}
                        label={`Успешно: ${results.length}`}
                        color="success"
                        variant="outlined"
                        size="small"
                      />
                    )}
                    {errors > 0 && (
                      <Chip
                        icon={<ErrorIcon />}
                        label={`Ошибок: ${errors}`}
                        color="error"
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {results.map((img, idx) => (
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
                            alt={`result-${idx}`}
                            style={{
                              width: '100%',
                              height: 200,
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
                            <Tooltip title="Скачать">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = img;
                                  link.download = `result_${idx + 1}.png`;
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
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{
                            color: 'text.secondary',
                            textAlign: 'center'
                          }}>
                            Изображение {idx + 1}
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

export default BatchPage;