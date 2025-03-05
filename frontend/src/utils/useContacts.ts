import { useState, useEffect } from 'react'
import { api } from './api'

interface WorkHours {
  monday_friday: string
  saturday_sunday: string
}

export interface ContactInfo {
  phone: string
  email: string
  work_hours: WorkHours
  social_links: {
    whatsapp: {
      enabled: boolean
      username: string
    }
    telegram: {
      enabled: boolean
      username: string
    }
    vk: {
      enabled: boolean
      username: string
    }
  }
}

// Срок кэширования данных (в миллисекундах)
const CACHE_EXPIRY_TIME = 1000 * 60 * 60 // 1 час

/**
 * Хук для получения контактных данных с кэшированием
 */
export function useContacts() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Сначала проверяем кэш в localStorage
        const cachedData = localStorage.getItem('contactInfoCache')
        
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData)
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY_TIME
          
          // Если кэш не истек, используем его
          if (!isExpired) {
            setContactInfo(data)
            setIsLoading(false)
            
            // Асинхронно обновляем кэш в фоне
            refreshCacheInBackground()
            return
          }
        }
        
        // Если кэша нет или он устарел, делаем запрос
        const data = await api.get('/contacts')
        setContactInfo(data)
        
        // Сохраняем в кэш
        localStorage.setItem('contactInfoCache', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
      } catch (err) {
        console.error('Ошибка при загрузке контактов:', err)
        setError(err instanceof Error ? err : new Error('Произошла ошибка при загрузке контактов'))
        
        // Пытаемся восстановить из кэша, даже если он устарел
        const cachedData = localStorage.getItem('contactInfoCache')
        if (cachedData) {
          const { data } = JSON.parse(cachedData)
          setContactInfo(data)
        }
      } finally {
        setIsLoading(false)
      }
    }
    
    // Функция для фонового обновления кэша
    const refreshCacheInBackground = async () => {
      try {
        const data = await api.get('/contacts')
        localStorage.setItem('contactInfoCache', JSON.stringify({
          data,
          timestamp: Date.now()
        }))
        setContactInfo(data)
      } catch (err) {
        console.error('Ошибка при фоновом обновлении кэша:', err)
      }
    }

    fetchContacts()
  }, [])

  return { contactInfo, isLoading, error }
} 