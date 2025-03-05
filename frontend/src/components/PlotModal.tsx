'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { LandPlot } from '@/types/land-plot'
import { 
  XMarkIcon,
  MapPinIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  BoltIcon,
  CheckBadgeIcon,
  Square2StackIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  PhoneIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { api } from '@/utils/api'
import { getImageUrl } from '@/utils/image'

// Словарь для отображения названий локаций
const LOCATION_NAMES: Record<string, string> = {
  'gorno-altaysk': 'Горно-Алтайск',
  'maima': 'Майма',
  'chemal': 'Чемал',
  'altayskoe': 'Алтайское',
  'belokurikha': 'Белокуриха',
  'other': 'Другие районы'
}

interface PlotModalProps {
  plot: LandPlot | null
  isOpen: boolean
  onClose: () => void
}

export default function PlotModal({ plot, isOpen, onClose }: PlotModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [contacts, setContacts] = useState<any>(null)

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return '0'
    return price.toLocaleString('ru-RU')
  }

  // Получаем первый кадастровый номер для отображения
  const getFirstCadastralNumber = (cadastralNumbers: string[] | undefined) => {
    if (!cadastralNumbers || cadastralNumbers.length === 0) {
      return 'Не указан'
    }
    return cadastralNumbers[0]
  }

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await api.get('/contacts')
        setContactInfo(data)
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }

    const fetchContacts = async () => {
      try {
        const data = await api.get('/contacts')
        setContacts(data)
      } catch (error) {
        console.error('Ошибка при загрузке контактов:', error)
      }
    }

    if (isOpen) {
      fetchContacts()
    }

    fetchContactInfo()
  }, [isOpen])

  if (!plot) return null

  const allImages = plot.images.map(img => img.path)

  // Добавим стили для галереи
  const galleryStyles = {
    height: '500px', // Увеличим высоту галереи
    buttonClasses: "absolute top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm",
    paginationClasses: "absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2"
  };

  // Функция для скачивания файла
  const downloadFile = async (url: string, filename: string) => {
    try {
      // Извлекаем путь файла из URL
      const filePath = url.replace('/uploads/', '');
      
      // Используем новый эндпоинт для скачивания
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/download/${filePath}`);
      
      if (!response.ok) {
        throw new Error(`Ошибка скачивания: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                <div className="relative">
                  {/* Галерея */}
                  <div className="relative h-[300px] sm:h-[400px] md:h-[500px] group">
                    <Swiper
                      modules={[Navigation, Pagination]}
                      navigation={{
                        prevEl: '.swiper-button-prev',
                        nextEl: '.swiper-button-next',
                      }}
                      pagination={{
                        clickable: true,
                        el: '.swiper-pagination',
                        bulletClass: 'w-2 h-2 rounded-full bg-white/50 transition-all cursor-pointer hover:bg-white',
                        bulletActiveClass: 'w-3 h-3 bg-white',
                      }}
                      onSlideChange={(swiper) => setCurrentImageIndex(swiper.activeIndex)}
                      className="h-full rounded-t-2xl overflow-hidden"
                    >
                      {allImages.map((image, index) => (
                        <SwiperSlide key={index}>
                          <div className="relative h-full bg-gray-100">
                            <img
                              src={getImageUrl(image)}
                              alt={`${plot.title} - фото ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    
                    {/* Обновляем стили кнопок навигации */}
                    <button 
                      className="swiper-button-prev !w-8 !h-8 sm:!w-10 sm:!h-10 !mt-0 hidden group-hover:flex absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm after:!content-['']"
                    >
                      <ChevronLeftIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
                    </button>
                    <button 
                      className="swiper-button-next !w-8 !h-8 sm:!w-10 sm:!h-10 !mt-0 hidden group-hover:flex absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white items-center justify-center rounded-full shadow-lg transition-all hover:scale-110 focus:ring-2 focus:ring-primary/20 backdrop-blur-sm after:!content-['']"
                    >
                      <ChevronRightIcon className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" />
                    </button>

                    {/* Счетчик изображений */}
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 bg-black/50 backdrop-blur-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-white text-xs sm:text-sm">
                      {currentImageIndex + 1} / {allImages.length}
                    </div>

                    {/* Улучшенная пагинация */}
                    <div className="swiper-pagination flex gap-2 justify-center" />
                  </div>

                  {/* Кнопка закрытия */}
                  <button
                    onClick={onClose}
                    className="absolute right-2 sm:right-4 top-2 sm:top-4 z-10 bg-white/80 hover:bg-white p-1.5 sm:p-2 rounded-full 
                             shadow-lg transition-all hover:scale-110 hover:rotate-90 focus:ring-2 focus:ring-primary/20"
                  >
                    <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </button>

                  {/* Контент */}
                  <div className="p-4 sm:p-6 md:p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                      {/* Основная информация */}
                      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                        {/* Заголовок и локация */}
                        <div className="border-b pb-3 sm:pb-4">
                          <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 mb-1 sm:mb-2">
                            <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary/60" />
                            <span className="text-base sm:text-lg">{LOCATION_NAMES[plot.location] || plot.location}, {plot.region}</span>
                          </div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{plot.title}</h2>
                        </div>

                        {/* Основные характеристики */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 py-3 sm:py-4">
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Площадь участка</div>
                            <div className="text-base sm:text-lg font-medium">{plot.area} м²</div>
                          </div>
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Стоимость за м²</div>
                            <div className="text-base sm:text-lg font-medium">{formatPrice(plot.price_per_meter)} ₽</div>
                          </div>
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Категория земли</div>
                            <div className="text-base sm:text-lg font-medium">{plot.land_category}</div>
                          </div>
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="text-xs sm:text-sm text-gray-500 mb-1">Статус участка</div>
                            <div className={`text-base sm:text-lg font-medium ${
                              plot.status === 'available' ? 'text-green-600' :
                              plot.status === 'reserved' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {plot.status === 'available' ? 'Свободен' :
                               plot.status === 'reserved' ? 'Забронирован' : 'Продан'}
                            </div>
                          </div>
                        </div>

                        {/* Ссылка на полное описание */}
                        <div className="flex">
                          <Link 
                            href={`/catalog/${plot.id}`}
                            className="group flex items-center text-primary font-medium hover:text-primary-dark ml-auto transition-colors"
                          >
                            <span>Подробнее</span>
                            <ArrowRightIcon className="w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>

                        {/* Кадастровый номер */}
                        {plot.cadastral_numbers && plot.cadastral_numbers.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center mb-2">
                              <span className="text-gray-900 font-medium">{plot.cadastral_numbers.length > 1 ? 'Кадастровые номера:' : 'Кадастровый номер:'}</span>
                            </div>
                            <div className="space-y-2">
                              {plot.cadastral_numbers.map((number, index) => (
                                <div key={index} className="flex flex-wrap items-center justify-between gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                  <span className="text-gray-900 font-medium">{number}</span>
                                  <a 
                                    href={`https://pkk.rosreestr.ru/#/search/${number}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-primary hover:text-primary-dark transition-colors"
                                  >
                                    Росреестр →
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Описание */}
                        {plot.description && (
                          <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold mb-3">Описание участка</h3>
                            <p className="text-gray-600 whitespace-pre-line">{plot.description.text}</p>

                            {/* Вложения */}
                            {plot.description.attachments && plot.description.attachments.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-base font-medium mb-2">Документы:</h4>
                                <div className="space-y-2">
                                  {plot.description.attachments.map((file, index) => (
                                    <div
                                      key={index}
                                      className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
                                    >
                                      <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 font-medium flex-grow min-w-0 truncate mr-2">
                                        {file.name}
                                      </span>
                                      <button
                                        onClick={() => downloadFile(file.url, file.name)}
                                        className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-white transition-all ml-auto mt-2 sm:mt-0"
                                        title="Скачать файл"
                                      >
                                        <ArrowDownTrayIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Коммуникации и особенности */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t pt-4">
                          {/* Коммуникации */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Коммуникации</h3>
                            <ul className="space-y-2">
                              {plot.communications.map((comm, index) => (
                                <li key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                  <BoltIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                  <span className="text-gray-600 text-sm">{comm}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Особенности */}
                          <div>
                            <h3 className="text-lg font-semibold mb-3">Особенности</h3>
                            <ul className="space-y-2">
                              {plot.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                                  <CheckBadgeIcon className="w-5 h-5 text-primary flex-shrink-0" />
                                  <span className="text-gray-600 text-sm">{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Сайдбар с ценой и контактами */}
                      <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-4">
                          <div className="mb-6">
                            <p className="text-4xl font-bold text-primary mb-2">
                              {formatPrice(plot.price)} ₽
                            </p>
                            <p className="text-gray-600">
                              {formatPrice(plot.price_per_meter)} ₽ за м²
                            </p>
                          </div>

                          <div className="space-y-4">
                            <Link
                              href={`/catalog/${plot.id}`}
                              className="btn-primary w-full justify-center"
                              onClick={onClose}
                            >
                              Подробнее об участке
                            </Link>
                            {contactInfo && (
                              <>
                                <a
                                  href={`tel:${contactInfo.phone}`}
                                  className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                  <PhoneIcon className="w-5 h-5" />
                                  <span>{contactInfo.phone}</span>
                                </a>
                                <div className="grid grid-cols-2 gap-4">
                                  {contactInfo.social_links.whatsapp.enabled && (
                                    <a
                                      href={`https://wa.me/${contactInfo.social_links.whatsapp.username}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-secondary flex items-center justify-center gap-1 py-3"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  {contactInfo.social_links.telegram.enabled && (
                                    <a
                                      href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-secondary flex items-center justify-center gap-2 py-3"
                                    >
                                      <span>Telegram</span>
                                    </a>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 