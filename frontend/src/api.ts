// api.ts
import axios from 'axios';

// Определяем базовый URL в зависимости от окружения
const API_BASE = process.env.NODE_ENV === 'production'
    ? '' // В продакшене используем относительные пути (тот же домен)
    : 'http://localhost:8000'; // В разработке используем локальный сервер

console.log('API Base URL:', API_BASE);

const api = axios.create({ baseURL: API_BASE });

// Флаг для предотвращения множественных запросов на обновление токена
let isRefreshing = false;
let failedQueue: any[] = [];

// Функция для обработки очереди неудачных запросов
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Интерцептор запросов - добавляем токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор ответов - обрабатываем автообновление токенов
api.interceptors.response.use(
  (response) => {
    console.log('API Success:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error('API Error:', error.config?.method?.toUpperCase(), error.config?.url, error.response?.status, error.response?.data);

    // Если получили 401 и это не запрос на обновление токена
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/refresh')) {
      if (isRefreshing) {
        // Если уже идет обновление токена, добавляем запрос в очередь
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        console.log('No refresh token, redirecting to login');
        // Очищаем токены и перенаправляем на логин
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        console.log('Attempting to refresh token');
        const response = await axios.post(`${API_BASE}/refresh`, {
          refresh_token: refreshToken
        });

        const { access_token, refresh_token: new_refresh_token } = response.data;

        // Сохраняем новые токены
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', new_refresh_token);

        console.log('Token refreshed successfully');

        // Обновляем заголовок авторизации
        api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        // Обрабатываем очередь неудачных запросов
        processQueue(null, access_token);

        isRefreshing = false;

        // Повторяем оригинальный запрос
        return api(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        // Обрабатываем очередь с ошибкой
        processQueue(refreshError, null);

        isRefreshing = false;

        // Очищаем токены и перенаправляем на логин
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export async function register(email: string, password: string) {
  console.log('Attempting registration for:', email);
  return api.post('/register', { email, password });
}

export async function login(email: string, password: string) {
  console.log('Attempting login for:', email);
  const res = await api.post('/login', { email, password });

  console.log('Login successful, storing tokens');
  localStorage.setItem('access_token', res.data.access_token);
  localStorage.setItem('refresh_token', res.data.refresh_token);

  return res;
}

export async function logout() {
  console.log('Attempting logout');
  const refreshToken = localStorage.getItem('refresh_token');

  if (refreshToken) {
    try {
      await api.post('/logout', { refresh_token: refreshToken });
    } catch (error) {
      console.warn('⚠️ Logout request failed, but continuing with local cleanup');
    }
  }

  // Очищаем токены локально
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');

  console.log('Logged out successfully');
}

export async function sendImage(file: File, filterType: string): Promise<{ image: string; duration_ms: number }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filter_type', filterType);
  const res = await api.post('/process/', formData);
  return res.data;
}

export async function sendBatchImagesInline(files: File[], filterType: string): Promise<string[]> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  formData.append("filter_type", filterType);

  const response = await api.post("/process/batch/inline/", formData);
  if (!response.data || !Array.isArray(response.data.images)) {
    console.warn("Неверный ответ от сервера:", response.data);
    return [];
  }
  return response.data.images;
}

export async function sendBatchImages(files: File[], filterType: string): Promise<Blob> {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  formData.append("filter_type", filterType);

  const response = await api.post("/process/batch/", formData, {
    responseType: "blob",
  });
  return response.data;
}

export async function sendVideo(file: File, filterType: string): Promise<string[]> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filter_type', filterType);

  const response = await api.post("/process/video/", formData);
  return response.data.frames;
}

export async function sendVideoZip(file: File, filterType: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('filter_type', filterType);

  const response = await api.post("/process/video/zip/", formData, {
    responseType: "blob",
  });
  return response.data;
}