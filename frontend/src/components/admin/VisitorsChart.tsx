'use client'

import { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { api } from '@/utils/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface VisitorData {
  time?: string
  date?: string
  visitors: number
}

interface VisitorsStats {
  hourly: VisitorData[]
  daily: VisitorData[]
  monthly: VisitorData[]
}

const PERIODS = [
  { id: 'hourly', label: 'За 24 часа' },
  { id: 'daily', label: 'За 7 дней' },
  { id: 'monthly', label: 'За 30 дней' }
] as const

type Period = typeof PERIODS[number]['id']

export default function VisitorsChart() {
  const [period, setPeriod] = useState<Period>('daily')
  const [stats, setStats] = useState<VisitorsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<VisitorsStats | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.get('/admin/stats/visitors', { isAdmin: true })
        setChartData(data)
      } catch (error) {
        console.error('Ошибка при загрузке статистики:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || !chartData) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-[300px] bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  const currentData = chartData[period]
  const labels = currentData.map(d => d.time || d.date)
  const values = currentData.map(d => d.visitors)

  const data = {
    labels,
    datasets: [
      {
        label: 'Посетители',
        data: values,
        borderColor: 'rgb(22 163 74)',
        backgroundColor: 'rgba(22 163 74, 0.5)',
        tension: 0.3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold">Статистика посещаемости</h2>
          <p className="text-sm text-gray-500">Время московское (UTC+3)</p>
        </div>
        <div className="flex gap-2">
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setPeriod(id)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                period === id
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Line options={options} data={data} />
      </div>
    </div>
  )
} 