/**
 * API URL конфигурация
 * В production режиме все запросы идут через nginx (/api)
 * В development режиме запросы идут напрямую на бэкенд
 */
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // В production используем относительный путь
  : 'http://localhost:8000';  // В development используем прямой адрес

export { API_URL };

// Это нужно для работы TypeScript с модулями
export {}; 