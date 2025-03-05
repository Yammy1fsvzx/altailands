import { API_URL } from '@/config/api';

export const getImageUrl = (path: string | undefined): string => {
  if (!path) return '/images/plot-placeholder.jpg';
  
  // Если путь уже является полным URL, возвращаем его как есть
  if (path.startsWith('http')) {
    return path;
  }
  
  // В противном случае добавляем базовый URL
  return `${API_URL}${path}`;
} 