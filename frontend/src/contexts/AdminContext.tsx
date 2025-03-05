'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/utils/api'

interface AdminContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  sessionToken: string | null
  checkAuth: () => Promise<void>
}

const AdminContext = createContext<AdminContextType | undefined>(undefined)

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setIsAuthenticated(false)
      setSessionToken(null)
      return
    }

    try {
      // Проверяем валидность токена
      const response = await fetch('https://altailands.ru/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error('Unauthorized')
      }
      setSessionToken(token)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Ошибка проверки сессии:', error)
      localStorage.removeItem('adminToken')
      setSessionToken(null)
      setIsAuthenticated(false)
    }
  }

  useEffect(() => {
    checkAuth().finally(() => setIsLoading(false))
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch('https://altailands.ru/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      if (!response.ok) {
        throw new Error('Failed to login')
      }
      const data = await response.json()
      localStorage.setItem('adminToken', data.session_token)
      setSessionToken(data.session_token)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Ошибка при входе:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('adminToken')
    setSessionToken(null)
    setIsAuthenticated(false)
  }

  if (isLoading) {
    return null // или компонент загрузки
  }

  return (
    <AdminContext.Provider value={{ isAuthenticated, login, logout, sessionToken, checkAuth }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider')
  }
  return context
} 