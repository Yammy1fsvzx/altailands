const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface FetchOptions extends RequestInit {
  isAdmin?: boolean
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
  const { isAdmin, ...fetchOptions } = options
  const headers = new Headers(fetchOptions.headers)

  // Устанавливаем базовые заголовки
  headers.set('Content-Type', 'application/json')

  // Если это админский запрос, добавляем токен
  if (isAdmin) {
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
      headers.set('X-Admin-Token', adminToken)
    } else {
      // Если токен не найден, но запрос админский - перенаправляем на логин
      window.location.href = '/admin/login'
      throw new Error('Отсутствует токен администратора')
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers
  })

  // Если получаем 401 или 422 при админском запросе, это может быть истекшая сессия
  if ((response.status === 401 || response.status === 422) && isAdmin) {
    localStorage.removeItem('adminToken')
    window.location.href = '/admin/login'
    throw new Error('Сессия истекла')
  }

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return response.json()
}

// Хелперы для разных типов запросов
export const api = {
  get: (endpoint: string, options: FetchOptions = {}) => 
    fetchApi(endpoint, { ...options, method: 'GET' }),
  
  post: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  put: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  
  patch: (endpoint: string, data: any, options: FetchOptions = {}) =>
    fetchApi(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  delete: (endpoint: string, options: FetchOptions = {}) =>
    fetchApi(endpoint, { ...options, method: 'DELETE' }),

  async uploadFile(file: File, type: string = 'document') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      const response = await fetch(`${API_BASE_URL}/uploads`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Upload error:', await response.text());  // Для отладки
        throw new Error('Ошибка при загрузке файла');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }
} 