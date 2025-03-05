'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { api } from '@/utils/api'

const SESSION_ID_KEY = 'session_id'

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Не отслеживаем посещения админки
    if (pathname?.startsWith('/admin')) {
      return
    }

    // Получаем или создаем session_id
    let sessionId = localStorage.getItem(SESSION_ID_KEY)
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem(SESSION_ID_KEY, sessionId)
    }

    // Функция для отправки данных о посещении
    const trackVisit = async () => {
      if (!sessionId) return // Защита от null

      try {
        await api.post('/admin/track-visit', { session_id: sessionId })
      } catch (error) {
        console.error('Ошибка при отслеживании посещения:', error)
      }
    }

    // Отслеживаем посещение при монтировании компонента
    trackVisit()

    // Устанавливаем интервал для периодического обновления статуса онлайн
    const interval = setInterval(trackVisit, 60000) // каждую минуту

    return () => clearInterval(interval)
  }, [pathname])

  return null
} 