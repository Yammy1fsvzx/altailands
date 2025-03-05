/**
 * API URL конфигурация
 * В production режиме все запросы идут через nginx (/api)
 * В development режиме запросы идут напрямую на бэкенд (http://localhost:8000)
 */
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'
  : 'http://localhost:8000';

export { API_URL };

// Это нужно для работы TypeScript с модулями
export {}; 