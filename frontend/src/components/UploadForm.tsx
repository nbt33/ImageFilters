import React, { useState } from 'react';
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Fade
} from '@mui/material';
import { CloudUpload, AutoFixHigh, Timer } from '@mui/icons-material';
import { sendImage } from '../api';
import { FilterType } from '../types';

interface Props {
  setResult: (result: { image: string; duration: number } | null) => void;
  setOriginalImageUrl: (url: string | null) => void;
}

const UploadForm: React.FC<Props> = ({ setResult, setOriginalImageUrl }) => {
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<FilterType>('canny');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await sendImage(file, filter);
      setResult({
        image: `data:image/png;base64,${response.image}`,
        duration: response.duration_ms
      });
    } catch (e) {
      console.error(e);
      alert('Ошибка при обработке');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setOriginalImageUrl(url);
    } else {
      setOriginalImageUrl(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleFileChange(files[0]);
    }
  };

  // Список всех доступных фильтров с описаниями
  const filterOptions = [
    { value: 'canny', label: 'Canny Edges', description: 'Детектор краев' },
    { value: 'stylize', label: 'Stylize', description: 'Стилизация изображения' },
    { value: 'kmeans', label: 'KMeans Segmentation', description: 'Сегментация по цветам' },
    { value: 'voronoi', label: 'Voronoi Diagram', description: 'Диаграмма Вороного' },
    { value: 'voronoi_colored', label: 'Voronoi (Colored)', description: 'Цветная диаграмма Вороного' },
    { value: 'adaptive_enhancement', label: 'Adaptive Enhancement', description: 'Адаптивное улучшение' },
    { value: 'neural_flow', label: 'Neural Flow', description: 'Нейронный поток' },
    { value: 'quantum_ripple', label: 'Quantum Ripple', description: 'Квантовая рябь' },
    { value: 'neon_dreams', label: 'Neon Dreams', description: 'Неоновые мечты' },
  ];

  const selectedFilterInfo = filterOptions.find(f => f.value === filter);

  return (
    <Box>
      {/* Зона загрузки файла */}
      <Paper
        sx={{
          border: dragOver
            ? '2px dashed rgba(99, 102, 241, 0.6)'
            : file
              ? '2px solid rgba(34, 197, 94, 0.6)'
              : '2px dashed rgba(99, 102, 241, 0.3)',
          borderRadius: 3,
          p: 4,
          textAlign: 'center',
          background: dragOver
            ? 'rgba(99, 102, 241, 0.1)'
            : file
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          style={{ display: 'none' }}
        />

        <CloudUpload sx={{
          fontSize: 48,
          color: file ? 'success.main' : 'primary.main',
          mb: 2
        }} />

        <Typography variant="h6" sx={{
          mb: 1,
          color: file ? 'success.main' : 'text.primary',
          fontWeight: 600
        }}>
          {file ? 'Файл загружен!' : 'Загрузите изображение'}
        </Typography>

        <Typography variant="body2" sx={{
          color: 'text.secondary',
          mb: 2
        }}>
          {file
            ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
            : 'Перетащите файл сюда или нажмите для выбора'
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
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel sx={{ color: 'text.secondary' }}>Выберите фильтр</InputLabel>
        <Select
          value={filter}
          label="Выберите фильтр"
          onChange={(e) => setFilter(e.target.value as FilterType)}
          sx={{
            backgroundColor: 'rgba(15, 15, 35, 0.6)',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99, 102, 241, 0.3)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(99, 102, 241, 0.5)',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            }
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                maxHeight: 400,
                background: 'rgba(30, 30, 46, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              },
            },
          }}
        >
          {filterOptions.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                }
              }}
            >
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {option.label}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {option.description}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Информация о выбранном фильтре */}
      {selectedFilterInfo && (
        <Fade in>
          <Paper sx={{
            p: 2,
            mb: 3,
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AutoFixHigh sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {selectedFilterInfo.label}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedFilterInfo.description}
            </Typography>
          </Paper>
        </Fade>
      )}

      {/* Кнопка обработки */}
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={loading || !file}
        fullWidth
        size="large"
        sx={{
          py: 1.5,
          fontSize: '1.1rem',
          fontWeight: 600,
          background: loading || !file
            ? 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          '&:hover': {
            background: !loading && file
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
            transform: !loading && file ? 'translateY(-2px)' : 'none',
            boxShadow: !loading && file
              ? '0 8px 20px -4px rgba(99, 102, 241, 0.4)'
              : 'none',
          },
          '&:disabled': {
            background: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
            color: 'rgba(255, 255, 255, 0.5)',
          }
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} sx={{ color: 'inherit' }} />
            <Timer sx={{ fontSize: 20 }} />
            Обработка...
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoFixHigh sx={{ fontSize: 20 }} />
            Применить фильтр
          </Box>
        )}
      </Button>

      {!file && (
        <Typography variant="caption" sx={{
          display: 'block',
          textAlign: 'center',
          color: 'text.secondary',
          mt: 2,
          opacity: 0.7
        }}>
          Поддерживаемые форматы: JPG, PNG, GIF, WebP
        </Typography>
      )}
    </Box>
  );
};

export default UploadForm;