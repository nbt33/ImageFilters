// ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  
  // Если есть хотя бы refresh токен, разрешаем доступ
  // Access токен может автоматически обновиться через интерцептор
  const isAuthenticated = accessToken || refreshToken;
  
  if (!isAuthenticated) {
    console.log('🚫 No tokens found, redirecting to login');
    return <Navigate to="/login" />;
  }
  
  return children;
};

export default ProtectedRoute;