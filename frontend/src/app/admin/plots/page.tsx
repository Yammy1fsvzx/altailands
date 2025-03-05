'use client'

import { useState, useEffect } from 'react'
import { LandPlot } from '@/types/land-plot'
import AdminLayout from '@/components/admin/AdminLayout'
import StatsCard from '@/components/admin/StatsCard'
import AdminPlotModal from '@/components/admin/AdminPlotModal'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  Square2StackIcon,
  CheckBadgeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GlobeAltIcon,
  ArrowsPointingOutIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { api } from '@/utils/api'
import { getImageUrl } from '@/utils/image'

type PlotStatus = 'available' | 'reserved' | 'sold'

export default function AdminPage() {
  const [plots, setPlots] = useState<LandPlot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPlots, setTotalPlots] = useState(0)
  const [selectedStatus, setSelectedStatus] = useState<PlotStatus | ''>('')
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const itemsPerPage = 9
  const router = useRouter()

  useEffect(() => {
    fetchPlots()
    fetchTotalPlots()
  }, [searchQuery, currentPage, selectedStatus])

  const fetchPlots = async () => {
    try {
      const params = new URLSearchParams({
        skip: ((currentPage - 1) * itemsPerPage).toString(),
        limit: itemsPerPage.toString(),
      })

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      const data = await api.get(`/admin/plots?${params}`, { isAdmin: true })
      setPlots(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка')
    } finally {
      setLoading(false)
    }
  }

  const fetchTotalPlots = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) {
        params.append('search', searchQuery)
      }
      if (selectedStatus) {
        params.append('status', selectedStatus)
      }

      const data = await api.get(`/admin/plots/count?${params}`, { isAdmin: true })
      setTotalPlots(data.total)
    } catch (err) {
      console.error('Ошибка при получении количества участков:', err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот участок?')) return
    
    try {
      await api.delete(`/admin/plots/${id}`, { isAdmin: true })
      await fetchPlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при удалении')
    }
  }

  const getStatusColor = (status: PlotStatus) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: PlotStatus) => {
    switch (status) {
      case 'available':
        return 'Свободен'
      case 'reserved':
        return 'Забронирован'
      case 'sold':
        return 'Продан'
      default:
        return status
    }
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return '0'
    return num.toLocaleString('ru-RU')
  }

  const handleVisibilityToggle = async (id: string, currentVisibility: boolean) => {
    try {
      const updatedPlot = await api.patch(`/admin/plots/${id}/visibility`, 
        { is_visible: !currentVisibility },
        { isAdmin: true }
      )
      
      // Обновляем только измененный участок в состоянии
      setPlots(plots.map(plot => 
        plot.id === id ? updatedPlot : plot
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при обновлении видимости')
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // Сбрасываем на первую страницу при поиске
  }

  const handleStatusFilter = (status: PlotStatus | '') => {
    setSelectedStatus(status)
    setCurrentPage(1) // Сбрасываем на первую страницу при фильтрации
  }

  const totalPages = Math.ceil(totalPlots / itemsPerPage)

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    )
  }

  // Статистика
  const availablePlots = plots.filter(p => p.status === 'available').length
  const reservedPlots = plots.filter(p => p.status === 'reserved').length
  const totalArea = plots.reduce((sum, plot) => sum + (plot.area || 0), 0)

  return (
    <AdminLayout>
      {/* Статистика */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6 sm:mb-8">
        <StatsCard
          title="Всего участков"
          value={totalPlots}
          icon={<Square2StackIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
        />
        <StatsCard
          title="Свободно"
          value={availablePlots}
          icon={<CheckBadgeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
          trend={{
            value: Math.round((availablePlots / totalPlots) * 100),
            label: 'от общего числа',
            isPositive: true
          }}
        />
        <StatsCard
          title="Забронировано"
          value={reservedPlots}
          icon={<MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
        />
        <StatsCard
          title="Общая площадь"
          value={`${formatNumber(totalArea)} м²`}
          icon={<CurrencyRupeeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
        />
      </div>

      {/* Основной контент */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:flex-wrap sm:gap-4 items-start sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Управление участками
          </h3>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-start sm:items-center gap-3 sm:gap-4">
            {/* Фильтр по статусу */}
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusFilter(e.target.value as PlotStatus | '')}
              className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            >
              <option value="">Все статусы</option>
              <option value="available">Свободные</option>
              <option value="reserved">Забронированные</option>
              <option value="sold">Проданные</option>
            </select>

            {/* Поиск */}
            <div className="relative w-full sm:w-auto flex-grow sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="Поиск по названию или кадастровому номеру..."
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* Кнопка добавления */}
            <button
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full sm:w-auto justify-center"
              onClick={() => router.push('/admin/plots/new')}
            >
              <PlusIcon className="h-5 w-5" />
              <span>Добавить участок</span>
            </button>
          </div>
        </div>

        {/* Плиточный вид */}
        <div className="border-t border-gray-200 p-4">
          {plots.length === 0 ? (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Нет участков</h3>
              <p className="mt-1 text-sm text-gray-500">
                Начните с добавления нового земельного участка
              </p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/admin/plots/new')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Добавить участок
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plots.map((plot) => (
                <div
                  key={plot.id}
                  className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-auto sm:h-[400px] relative overflow-hidden"
                >
                  {/* Изображение */}
                  <div className="relative h-32 sm:h-40 flex-shrink-0">
                    {plot.images && plot.images.length > 0 ? (
                      <img
                        src={getImageUrl(plot.images[0].path)}
                        alt={plot.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <PhotoIcon className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300" />
                      </div>
                    )}
                    {/* Кнопки действий над изображением */}
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedPlot(plot)
                          setIsModalOpen(true)
                        }}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
                        title="Предпросмотр"
                      >
                        <ArrowsPointingOutIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={() => handleVisibilityToggle(plot.id, plot.is_visible)}
                        className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow hover:bg-white transition-colors"
                        title={plot.is_visible ? "Скрыть участок" : "Показать участок"}
                      >
                        {plot.is_visible ? (
                          <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
                        ) : (
                          <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Контент */}
                  <div className="flex flex-col flex-grow p-3">
                    {/* Заголовок и статус */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base font-medium text-gray-900 leading-5 truncate">
                          {plot.title}
                        </h4>
                      </div>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(plot.status as PlotStatus)}`}>
                        {getStatusText(plot.status as PlotStatus)}
                      </span>
                    </div>

                    {/* Местоположение и кадастровый номер */}
                    <div className="space-y-1.5 mb-2">
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <MapPinIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{plot.location}, {plot.region}</span>
                      </div>
                    </div>


                    {/* Сетка с площадью и ценой */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Площадь:</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900">{plot.area} м²</div>
                        {plot.specified_area && (
                          <div className="text-xs text-gray-500">
                            Уточн.: {plot.specified_area} сот.
                          </div>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">Цена:</div>
                        <div className="font-medium text-sm sm:text-base text-gray-900">{formatNumber(plot.price)} ₽</div>
                        <div className="text-xs text-gray-500">
                          {formatNumber(plot.price_per_meter)} ₽/сот.
                        </div>
                      </div>
                    </div>

                    {/* Кнопки действий */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => router.push(`/admin/plots/${plot.id}/edit`)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span className="sm:inline">Редактировать</span>
                        </button>
                        <button
                          onClick={() => handleDelete(plot.id)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span className="sm:inline">Удалить</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px overflow-x-auto max-w-full p-1" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Предыдущая</span>
                  <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                </button>
                
                {/* Адаптивная пагинация: показываем только ближайшие страницы на мобильных */}
                {[...Array(totalPages)].map((_, i) => {
                  // На мобильных показываем только текущую страницу, первую, последнюю и те, что рядом с текущей
                  const pageNum = i + 1;
                  const isVisible = 
                    pageNum === 1 || 
                    pageNum === totalPages || 
                    Math.abs(pageNum - currentPage) <= 1 ||
                    totalPages <= 7;
                  
                  if (!isVisible) {
                    // Добавляем многоточие только в местах разрыва
                    if (pageNum === 2 || pageNum === totalPages - 1) {
                      return (
                        <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-3 sm:px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                >
                  <span className="sr-only">Следующая</span>
                  <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно предпросмотра */}
      <AdminPlotModal
        plot={selectedPlot}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedPlot(null)
        }}
      />

      {/* Сообщение об ошибке */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          {error}
        </div>
      )}
    </AdminLayout>
  )
} 