'use client'

import LoginForm from '@/components/admin/LoginForm'
import { useAdmin } from '@/contexts/AdminContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AdminLoginPage() {
  const { isAuthenticated, checkAuth } = useAdmin()
  const router = useRouter()
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
    if (!isChecking && isAuthenticated) {
      router.push('/admin/dashboard')
    }
  }, [isAuthenticated, router, isChecking])

  if (isChecking) {
    return null // или компонент загрузки
  }

  return <LoginForm />
} 