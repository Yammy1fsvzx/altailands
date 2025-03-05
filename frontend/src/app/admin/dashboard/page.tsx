'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'
import VisitorsChart from '@/components/admin/VisitorsChart'
import { UsersIcon } from '@heroicons/react/24/outline'
import { api } from '@/utils/api'

interface Stats {
  total_requests: number
  new_requests: number
  completed_requests: number
  total_plots: number
  available_plots: number
  quiz_questions: number
  quiz_completions: number
  current_online: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_requests: 0,
    new_requests: 0,
    completed_requests: 0,
    total_plots: 0,
    available_plots: 0,
    quiz_questions: 0,
    quiz_completions: 0,
    current_online: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setError(null)
      const data = await api.get('/admin/stats', { isAdmin: true })
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setError('Ошибка при загрузке статистики')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout title="Панель управления">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout title="Панель управления">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-500">{error}</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Панель управления">
      {/* Текущие онлайн пользователи */}
      <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <UsersIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div className="text-sm text-green-600 font-medium">Сейчас на сайте</div>
            <div className="text-2xl font-bold text-green-700">{stats.current_online} пользователей</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-600">Онлайн</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* График посещаемости */}
        <VisitorsChart />

        {/* Основная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Статистика заявок */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Заявки</h2>
              <Link href="/admin/requests" className="text-primary hover:text-primary-dark">
                Все заявки
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Всего заявок</div>
                <div className="text-2xl font-semibold">{stats.total_requests}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Новых</div>
                  <div className="text-xl font-semibold text-yellow-600">{stats.new_requests}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Обработано</div>
                  <div className="text-xl font-semibold text-green-600">{stats.completed_requests}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Статистика участков */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Участки</h2>
              <Link href="/admin/plots" className="text-primary hover:text-primary-dark">
                Все участки
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Всего участков</div>
                <div className="text-2xl font-semibold">{stats.total_plots}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Доступно</div>
                <div className="text-xl font-semibold text-green-600">{stats.available_plots}</div>
              </div>
            </div>
          </div>

          {/* Статистика квиза */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Квиз</h2>
              <Link href="/admin/quiz" className="text-primary hover:text-primary-dark">
                Управление
              </Link>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Вопросов</div>
                <div className="text-2xl font-semibold">{stats.quiz_questions}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">Прохождений</div>
                <div className="text-xl font-semibold">{stats.quiz_completions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}