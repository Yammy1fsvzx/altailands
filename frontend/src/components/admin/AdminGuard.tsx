'use client'

import { useAdmin } from '@/contexts/AdminContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAdmin()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const verify = async () => {
      try {
        await checkAuth()
      } catch (error) {
        console.error('Ошибка проверки авторизации:', error)
      } finally {
        setIsChecking(false)
      }
    }

    verify()
  }, [checkAuth])

  useEffect(() => {
    if (!isChecking && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isAuthenticated, router, pathname, isChecking])

  if (isChecking) {
    return null // или компонент загрузки
  }

  if (!isAuthenticated && pathname !== '/admin/login') {
    return null
  }

  return <>{children}</>
} 