'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { toast } from 'react-hot-toast'
import { formatPhoneNumber } from '@/utils/formatters'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { API_URL } from '@/config/api'

interface Request {
  id: number
  type: 'quiz' | 'contact_form' | 'callback'
  name: string
  phone: string
  email?: string
  message?: string
  answers?: Record<string, string>
  promo_code?: string
  status: string
  created_at: string
  updated_at: string
  notes?: string
}

const REQUEST_TYPES = {
  quiz: 'Квиз',
  contact_form: 'Контактная форма',
  callback: 'Обратный звонок'
}

const REQUEST_STATUSES = {
  new: 'Новая',
  processing: 'В обработке',
  completed: 'Завершена',
  rejected: 'Отклонена'
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchRequests()
  }, [statusFilter, typeFilter])

  const fetchRequests = async () => {
    try {
      let url = 'http://localhost:8000/admin/requests'
      const params = new URLSearchParams()
      
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      toast.error('Ошибка при загрузке заявок')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: selectedRequest?.notes
        })
      })

      if (response.ok) {
        toast.success('Статус заявки обновлен')
        fetchRequests()
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error updating request:', error)
      toast.error('Ошибка при обновлении заявки')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AdminLayout title="Заявки">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Заявки">
      {/* Фильтры */}
      <div className="bg-white rounded-lg shadow p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Тип заявки
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Все типы</option>
              {Object.entries(REQUEST_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Статус
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
            >
              <option value="">Все статусы</option>
              {Object.entries(REQUEST_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Список заявок */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Мобильный вид списка заявок */}
        <div className="sm:hidden">
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Заявки не найдены</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {REQUEST_STATUSES[request.status as keyof typeof REQUEST_STATUSES]}
                      </span>
                      <span className="ml-2 text-xs text-gray-500">
                        {formatDate(request.created_at)}
                      </span>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 rounded-md">
                      {REQUEST_TYPES[request.type]}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900">{request.name}</h4>
                  
                  <div className="mt-1">
                    <a href={`tel:${request.phone}`} className="text-sm text-green-600 hover:text-green-700 block">
                      {formatPhoneNumber(request.phone)}
                    </a>
                    {request.email && (
                      <a href={`mailto:${request.email}`} className="text-sm text-green-600 hover:text-green-700 block mt-1 break-all">
                        {request.email}
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="mt-3 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Подробнее
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Десктопный вид списка заявок в таблице */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Имя
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Заявки не найдены
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {REQUEST_TYPES[request.type]}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.name}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <a href={`tel:${request.phone}`} className="text-green-600 hover:text-green-700">
                          {formatPhoneNumber(request.phone)}
                        </a>
                      </div>
                      {request.email && (
                        <div>
                          <a href={`mailto:${request.email}`} className="text-green-600 hover:text-green-700">
                            {request.email}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : request.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : request.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {REQUEST_STATUSES[request.status as keyof typeof REQUEST_STATUSES]}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Модальное окно с деталями заявки */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Заявка #{selectedRequest.id}
                </h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Закрыть</span>
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500">Тип заявки</div>
                    <div className="mt-1">{REQUEST_TYPES[selectedRequest.type]}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Дата создания</div>
                    <div className="mt-1">{formatDate(selectedRequest.created_at)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Имя</div>
                    <div className="mt-1">{selectedRequest.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Телефон</div>
                    <div className="mt-1">
                      <a href={`tel:${selectedRequest.phone}`} className="text-green-600 hover:text-green-700">
                        {formatPhoneNumber(selectedRequest.phone)}
                      </a>
                    </div>
                  </div>
                  {selectedRequest.email && (
                    <div className="col-span-1 sm:col-span-2">
                      <div className="text-sm font-medium text-gray-500">Email</div>
                      <div className="mt-1">
                        <a href={`mailto:${selectedRequest.email}`} className="text-green-600 hover:text-green-700 break-all">
                          {selectedRequest.email}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {selectedRequest.message && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Сообщение</div>
                    <div className="mt-1 whitespace-pre-wrap bg-gray-50 rounded-md p-3 text-sm">{selectedRequest.message}</div>
                  </div>
                )}

                {selectedRequest.answers && Object.keys(selectedRequest.answers).length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">Ответы на вопросы</div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-sm">
                      {Object.entries(selectedRequest.answers).map(([question, answer]) => (
                        <div key={question} className="mb-2 last:mb-0">
                          <div className="font-medium">{question}</div>
                          <div className="text-gray-600">{answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.promo_code && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Промокод</div>
                    <div className="mt-1 font-mono bg-gray-50 px-2 py-1 rounded">
                      {selectedRequest.promo_code}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Заметки</div>
                  <textarea
                    value={selectedRequest.notes || ''}
                    onChange={(e) => setSelectedRequest({
                      ...selectedRequest,
                      notes: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm h-24"
                    placeholder="Добавьте заметки к заявке..."
                  />
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-2">Статус</div>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => handleStatusChange(selectedRequest.id, e.target.value)}
                    className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  >
                    {Object.entries(REQUEST_STATUSES).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
} 