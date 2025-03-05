import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, PhotoIcon, MapPinIcon, GlobeAltIcon, EyeIcon, EyeSlashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { LandPlot } from '@/types/land-plot'
import { getImageUrl } from '@/utils/image'
import { useRouter } from 'next/navigation'

interface AdminPlotModalProps {
  plot: LandPlot | null
  isOpen: boolean
  onClose: () => void
}

// Функция для определения цвета статуса
const getStatusColor = (status: string): string => {
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

// Функция для перевода статуса
const getStatusText = (status: string): string => {
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

// Функция для форматирования чисел
const formatNumber = (num: number | undefined): string => {
  if (num === undefined) return '0'
  return num.toLocaleString('ru-RU')
}

export default function AdminPlotModal({ plot, isOpen, onClose }: AdminPlotModalProps) {
  const router = useRouter()

  if (!plot) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all max-h-[80vh] flex flex-col">
                {plot ? (
                  <>
                    <div className="flex justify-between items-center px-4 py-3 sm:px-6 border-b border-gray-200">
                      <Dialog.Title as="h3" className="text-base sm:text-lg font-semibold leading-6 text-gray-900 truncate pr-4">
                        {plot.title}
                      </Dialog.Title>
                      <button
                        type="button"
                        className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        onClick={onClose}
                      >
                        <span className="sr-only">Закрыть</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="overflow-y-auto p-4 sm:p-6 flex-grow">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Информация о участке */}
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Информация о участке</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-gray-500">Статус</p>
                                <p className="font-medium text-sm sm:text-base">
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(plot.status)}`}>
                                    {getStatusText(plot.status)}
                                  </span>
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Номер участка</p>
                                <p className="font-medium text-sm sm:text-base">{(plot as any).plot_number || "—"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Расположение</p>
                                <p className="font-medium text-sm sm:text-base">{plot.location || "—"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Регион</p>
                                <p className="font-medium text-sm sm:text-base">{plot.region || "—"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Площадь (м²)</p>
                                <p className="font-medium text-sm sm:text-base">{plot.area || "—"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Площадь (сот.)</p>
                                <p className="font-medium text-sm sm:text-base">{plot.specified_area || "—"}</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Цена</p>
                                <p className="font-medium text-sm sm:text-base">{formatNumber(plot.price)} ₽</p>
                              </div>
                              
                              <div>
                                <p className="text-xs text-gray-500">Цена за сотку</p>
                                <p className="font-medium text-sm sm:text-base">{formatNumber(plot.price_per_meter)} ₽/сот.</p>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500">Кадастровый номер</p>
                              <p className="font-medium text-sm sm:text-base break-all">{plot.cadastral_numbers?.[0] || "—"}</p>
                            </div>
                          </div>

                          {/* Описание */}
                          <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">Описание</h4>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {typeof plot.description === 'object' && plot.description !== null 
                                 ? plot.description.text 
                                 : plot.description || "Описание отсутствует"}
                              </p>
                            </div>
                          </div>

                          {/* Особенности и коммуникации */}
                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Особенности */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Особенности</h4>
                              <div className="bg-gray-50 rounded-lg p-4 h-full">
                                {plot.features && plot.features.length > 0 ? (
                                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                    {plot.features.map((feature, index) => (
                                      <li key={index}>{feature}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">Нет данных</p>
                                )}
                              </div>
                            </div>

                            {/* Коммуникации */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-500 mb-2">Коммуникации</h4>
                              <div className="bg-gray-50 rounded-lg p-4 h-full">
                                {plot.communications && plot.communications.length > 0 ? (
                                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                                    {plot.communications.map((comm, index) => (
                                      <li key={index}>{comm}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">Нет данных</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Изображения и карта */}
                        <div>
                          {/* Карусель изображений */}
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Изображения</h4>
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            {plot.images && plot.images.length > 0 ? (
                              <div className="flex gap-2 overflow-x-auto pb-2 snap-x">
                                {plot.images.map((image, index) => (
                                  <div 
                                    key={index} 
                                    className="min-w-[200px] sm:min-w-[250px] h-[150px] sm:h-[180px] rounded overflow-hidden flex-shrink-0 snap-center"
                                  >
                                    <img 
                                      src={getImageUrl(image.path)} 
                                      alt={`Изображение ${index + 1}`}
                                      className="w-full h-full object-cover" 
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-40 bg-gray-100 rounded">
                                <PhotoIcon className="h-16 w-16 text-gray-300" />
                              </div>
                            )}
                          </div>

                          {/* Карта */}
                          <h4 className="text-sm font-medium text-gray-500 mb-2">Расположение на карте</h4>
                          <div className="bg-gray-50 rounded-lg p-4 h-[250px]">
                            {plot.coordinates ? (
                              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                <GlobeAltIcon className="h-12 w-12 text-gray-400" />
                                <p className="ml-2 text-sm text-gray-500">Предпросмотр карты недоступен</p>
                              </div>
                            ) : (
                              <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center">
                                <MapPinIcon className="h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">Координаты не указаны</p>
                              </div>
                            )}
                          </div>

                          {/* Видимость на сайте */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700">Видимость на сайте</h4>
                                <p className="text-xs text-gray-500">
                                  {plot.is_visible ? 'Участок виден посетителям сайта' : 'Участок скрыт от посетителей'}
                                </p>
                              </div>
                              <span className={`flex-shrink-0 h-6 w-6 rounded-full ${plot.is_visible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} flex items-center justify-center`}>
                                {plot.is_visible ? (
                                  <EyeIcon className="h-4 w-4" />
                                ) : (
                                  <EyeSlashIcon className="h-4 w-4" />
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 sm:px-6 bg-gray-50 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                      <button
                        type="button"
                        onClick={() => router.push(`/admin/plots/${plot.id}/edit`)}
                        className="inline-flex justify-center items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Редактировать
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex justify-center items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        Закрыть
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Загрузка данных...</p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 