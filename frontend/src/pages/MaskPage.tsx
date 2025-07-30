// src/pages/MaskPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import {
  Box, Button, Typography, Slider, IconButton, Input,
} from '@mui/material';
import {
  Undo, Redo, Save, ArrowBack, ArrowForward,
} from '@mui/icons-material';
import { ChromePicker } from 'react-color';
import { useNavigate } from 'react-router-dom';

const MaskPage: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [masks, setMasks] = useState<Record<string, string[]>>({});
  const [brushSize, setBrushSize] = useState(10);
  const [color, setColor] = useState('#FF0000');
  const [drawing, setDrawing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [history, setHistory] = useState<Record<number, ImageData[]>>({});
  const [redoStack, setRedoStack] = useState<Record<number, ImageData[]>>({});
  const navigate = useNavigate();

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scaledWrapperRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ dragging: boolean, x: number, y: number }>({ dragging: false, x: 0, y: 0 });

  const currentFile = images[imageIndex];

  const loadImage = () => {
    if (!currentFile || !imageCanvasRef.current || !maskCanvasRef.current) return;

    const img = new Image();
    img.src = URL.createObjectURL(currentFile);

    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      const imageCanvas = imageCanvasRef.current!;
      const maskCanvas = maskCanvasRef.current!;

      imageCanvas.width = width;
      imageCanvas.height = height;
      maskCanvas.width = width;
      maskCanvas.height = height;

      const imgCtx = imageCanvas.getContext('2d')!;
      imgCtx.clearRect(0, 0, width, height);
      imgCtx.drawImage(img, 0, 0);

      const maskCtx = maskCanvas.getContext('2d')!;
      maskCtx.clearRect(0, 0, width, height);
      maskCtx.lineCap = 'round';
      maskCtx.lineJoin = 'round';
      maskCtx.lineWidth = brushSize;
      maskCtx.strokeStyle = color;
      ctxRef.current = maskCtx;
    };
  };

  useEffect(() => {
    loadImage();
  }, [currentFile]);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth = brushSize;
      ctxRef.current.strokeStyle = color;
    }
  }, [brushSize, color]);

  const saveHistory = () => {
    const canvas = maskCanvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory(prev => ({
      ...prev,
      [imageIndex]: [...(prev[imageIndex] || []), snapshot],
    }));
    setRedoStack(prev => ({ ...prev, [imageIndex]: [] }));
  };

  const undo = () => {
    const ctx = ctxRef.current;
    const canvas = maskCanvasRef.current;
    const stack = history[imageIndex];
    if (!ctx || !canvas || !stack?.length) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newStack = [...stack];
    const last = newStack.pop()!;
    setHistory(prev => ({ ...prev, [imageIndex]: newStack }));
    setRedoStack(prev => ({
      ...prev,
      [imageIndex]: [...(prev[imageIndex] || []), current]
    }));
    ctx.putImageData(last, 0, 0);
  };

  const redo = () => {
    const ctx = ctxRef.current;
    const canvas = maskCanvasRef.current;
    const stack = redoStack[imageIndex];
    if (!ctx || !canvas || !stack?.length) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newStack = [...stack];
    const next = newStack.pop()!;
    setRedoStack(prev => ({ ...prev, [imageIndex]: newStack }));
    setHistory(prev => ({
      ...prev,
      [imageIndex]: [...(prev[imageIndex] || []), current]
    }));
    ctx.putImageData(next, 0, 0);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2) {
      const scroll = scrollContainerRef.current;
      if (scroll) {
        dragRef.current = { dragging: true, x: e.clientX, y: e.clientY };
      }
      return;
    }

    const ctx = ctxRef.current;
    if (!ctx) return;
    saveHistory();
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.dragging && scrollContainerRef.current) {
      const dx = e.clientX - dragRef.current.x;
      const dy = e.clientY - dragRef.current.y;
      scrollContainerRef.current.scrollLeft -= dx;
      scrollContainerRef.current.scrollTop -= dy;
      dragRef.current.x = e.clientX;
      dragRef.current.y = e.clientY;
      return;
    }

    if (!drawing || !ctxRef.current || e.buttons !== 1) return;
    ctxRef.current.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctxRef.current.stroke();
  };

  const handleMouseUp = () => {
    dragRef.current.dragging = false;
    if (ctxRef.current) ctxRef.current.closePath();
    setDrawing(false);
  };

  const saveMask = () => {
    const canvas = maskCanvasRef.current;
    if (!canvas || !currentFile) return;
    const dataURL = canvas.toDataURL();
    const key = currentFile.name;
    setMasks((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), dataURL],
    }));
  };

  const downloadZip = async () => {
    const zip = new JSZip();
    Object.entries(masks).forEach(([filename, maskList]) => {
      const folder = zip.folder(filename.replace(/\.[^/.]+$/, ''));
      if (!folder) return;
      maskList.forEach((m, i) => {
        const base64 = m.split(',')[1];
        folder.file(`mask_${i + 1}.png`, base64, { base64: true });
      });
    });

    images.forEach((file) => {
      const base = file.name.replace(/\.[^/.]+$/, '');
      const folder = zip.folder(base);
      if (folder) {
        folder.file(file.name, file);
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'masks_by_image.zip';
    a.click();
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.min(Math.max(0.1, prev + delta), 8));
  };

  return (
    <Box sx={{ mt: 0, position: 'relative' }}>
      <Button sx={{ mt: 4 }} variant="text" onClick={() => window.history.back()}>
        ⬅ Назад
      </Button>

      <Typography variant="h5">Создание маски</Typography>

      <Input
        type="file"
        inputProps={{ multiple: true, accept: 'image/*' }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length > 0) {
            setImages(files);
            setImageIndex(0);
          }
        }}
      />

      {currentFile && (
        <>
          <Typography sx={{ mt: 2 }}>{currentFile.name}</Typography>

          <Box
            ref={scrollContainerRef}
            sx={{
              mt: 2,
              border: '1px solid gray',
              overflow: 'auto',
              maxHeight: '80vh',
              maxWidth: '100%',
            }}
            onWheel={handleWheel}
          >
            <Box
              ref={scaledWrapperRef}
              sx={{
                width: `${100 * zoom}%`,
                height: `${100 * zoom}%`,
                transform: `scale(${1 / zoom})`,
                transformOrigin: 'top left',
                position: 'relative'
              }}
            >
              <canvas
                ref={imageCanvasRef}
                style={{
                  zIndex: 0,
                  position: 'relative',
                  display: 'block',
                  userSelect: 'none',
                }}
              />
              <canvas
                ref={maskCanvasRef}
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  pointerEvents: 'auto',
                  cursor: 'crosshair',
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onContextMenu={(e) => e.preventDefault()}
              />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            <Button onClick={saveMask} startIcon={<Save />}>Сохранить маску</Button>
            <Button onClick={undo} startIcon={<Undo />}>Отменить</Button>
            <Button onClick={redo} startIcon={<Redo />}>Вернуть</Button>
            <Button onClick={() => {
              const ctx = ctxRef.current;
              const canvas = maskCanvasRef.current;
              if (ctx && canvas) {
                saveHistory();
                ctx.clearRect(0, 0, canvas.width, canvas.height);
              }
            }}>Очистить</Button>
            <Button onClick={downloadZip}>Скачать все</Button>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography>Размер кисти</Typography>
            <Slider min={1} max={50} value={brushSize} onChange={(_, val) => setBrushSize(val as number)} />
            <ChromePicker color={color} onChange={(c) => setColor(c.hex)} disableAlpha />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: -10 }}>
            <Box sx={{ width: 'fit-content' }}>
              <Typography>Масштаб</Typography>
              <Slider
                min={0.1}
                max={8}
                step={0.1}
                value={zoom}
                onChange={(_, val) => setZoom(val as number)}
                sx={{ width: 200 }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              position: 'fixed',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1000,
              display: 'flex',
              gap: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              padding: '4px 8px',
              borderRadius: '8px',
              boxShadow: 3,
            }}
          >
            <IconButton onClick={() => setImageIndex(i => Math.max(0, i - 1))}>
              <ArrowBack />
            </IconButton>
            <IconButton onClick={() => setImageIndex(i => Math.min(images.length - 1, i + 1))}>
              <ArrowForward />
            </IconButton>
          </Box>
        </>
      )}
    </Box>
  );
};

export default MaskPage;
