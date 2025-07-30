import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Google Fonts для красивой типографики
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

// Добавляем кастомные CSS анимации
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    25% { transform: translateY(-10px) rotate(1deg); }
    50% { transform: translateY(-5px) rotate(-1deg); }
    75% { transform: translateY(-15px) rotate(0.5deg); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
    50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  }

  .shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200px 100%;
    animation: shimmer 2s infinite;
  }

  .glow-on-hover {
    transition: all 0.3s ease;
  }

  .glow-on-hover:hover {
    animation: glow 2s infinite;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);