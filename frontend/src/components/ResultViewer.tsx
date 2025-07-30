import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Button, 
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Fade,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import { 
  Download, 
  Timer, 
  ZoomIn, 
  Share, 
  CheckCircle,
  Close 
} from '@mui/icons-material';

interface Props {
  imageBase64: string;
  durationMs: number;
}

const ResultViewer: React.FC<Props> = ({ imageBase64, durationMs }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageBase64;
    link.download = `filtered_image_${Date.now()}.png`;
    link.click();
    
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        // Конвертируем base64 в blob для шаринга
        const response = await fetch(imageBase64);
        const blob = await response.blob();
        const file = new File([blob], 'filtered_image.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Обработанное изображение',
          text: 'Посмотрите на результат обработки изображения!',
          files: [file]
        });
      } catch (error) {
        console.log('Ошибка при попытке поделиться:', error);
        handleDownload(); // Fallback к скачиванию
      }
    } else {
      handleDownload(); // Fallback к скачиванию если Share API не поддерживается
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms} мс`;
    return `${(ms / 1000).toFixed(1)} сек`;
  };

  const getPerformanceColor = (ms: number) => {
    if (ms < 1000) return 'success';
    if (ms < 3000) return 'warning';
    return 'error';
  };

  return (
    <Fade in timeout={600}>
      <Box>
        {/* Заголовок результата */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 3 
        }}>
          <Typography variant="h6" sx={{ 
            color: 'text.primary',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <CheckCircle sx={{ color: 'success.main', fontSize: 24 }} />
            Обработка завершена
          </Typography>

          <Chip 
            icon={<Timer />}
            label={formatDuration(durationMs)}
            color={getPerformanceColor(durationMs)}
            variant="outlined"
            size="small"
            sx={{ 
              fontWeight: 500,
              '& .MuiChip-icon': {
                fontSize: 16
              }
            }}
          />
        </Box>

        {/* Контейнер изображения */}
        <Paper sx={{ 
          position: 'relative',
          borderRadius: 3,
          overflow: 'hidden',
          border: '2px solid rgba(99, 102, 241, 0.2)',
          background: 'rgba(15, 15, 35, 0.3)',
          mb: 3,
          '&:hover': {
            border: '2px solid rgba(99, 102, 241, 0.4)',
          }
        }}>
          <Box sx={{ 
            position: 'relative',
            '& img': {
              width: '100%',
              height: 'auto',
              display: 'block',
              borderRadius: 1,
            }
          }}>
            <img 
              src={imageBase64} 
              alt="Filtered result" 
              style={{ 
                cursor: 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onClick={() => setFullscreenOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
            
            {/* Overlay с кнопкой увеличения */}
            <Box sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              opacity: 0,
              transition: 'opacity 0.2s ease',
              '.MuiPaper-root:hover &': {
                opacity: 1
              }
            }}>
              <Tooltip title="Увеличить">
                <IconButton 
                  onClick={() => setFullscreenOpen(true)}
                  sx={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    }
                  }}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Статистика обработки */}
        <Paper sx={{ 
          p: 2, 
          mb: 3,
          background: 'rgba(99, 102, 241, 0.05)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 2
        }}>
          <Typography variant="subtitle2" sx={{ 
            color: 'text.primary', 
            mb: 1,
            fontWeight: 600
          }}>
            Информация об обработке
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Timer />}
              label={`Время: ${formatDuration(durationMs)}`}
              size="small"
              variant="outlined"
            />
            <Chip 
              label="Формат: PNG"
              size="small"
              variant="outlined"
            />
            <Chip 
              label="Качество: Высокое"
              size="small"
              variant="outlined"
            />
          </Box>
        </Paper>

        {/* Кнопки действий */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            onClick={handleDownload}
            startIcon={downloaded ? <CheckCircle /> : <Download />}
            sx={{ 
              flex: 1,
              minWidth: 160,
              py: 1.2,
              background: downloaded 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: downloaded
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            {downloaded ? 'Загружено!' : 'Скачать'}
          </Button>

          <Button
            variant="outlined"
            onClick={handleShare}
            startIcon={<Share />}
            sx={{ 
              flex: 1,
              minWidth: 160,
              py: 1.2,
              borderColor: 'rgba(99, 102, 241, 0.4)',
              color: 'primary.light',
              '&:hover': {
                borderColor: 'rgba(99, 102, 241, 0.6)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Поделиться
          </Button>
        </Box>

        {/* Полноэкранный просмотр */}
        <Dialog
          open={fullscreenOpen}
          onClose={() => setFullscreenOpen(false)}
          maxWidth={false}
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(15, 15, 35, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 2,
              maxWidth: '90vw',
              maxHeight: '90vh',
            }
          }}
        >
          <DialogContent sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <img 
              src={imageBase64} 
              alt="Full size result" 
              style={{ 
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: 8
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setFullscreenOpen(false)} startIcon={<Close />}>
              Закрыть
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="contained"
              startIcon={<Download />}
            >
              Скачать
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
};

export default ResultViewer;