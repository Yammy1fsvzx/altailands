'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Thumbs } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/thumbs'
import Header from '@/components/Header'
import ScrollAnimation from '@/components/ScrollAnimation'
import LandPlotCard from '@/components/LandPlotCard'
import Footer from '@/components/Footer'
import { LandPlot } from '@/types/land-plot'
import { 
  MapPinIcon, 
  PhoneIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  BoltIcon,
  CheckBadgeIcon,
  Square2StackIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  TruckIcon,
  ArrowRightIcon,
  ArrowDownTrayIcon,
  ArrowsPointingOutIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { formatPhoneNumber } from '@/utils/formatters'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import ImageGallery from '@/components/ImageGallery'
import { api } from '@/utils/api'
import { API_URL } from '@/config/api'

// Словарь для отображения названий локаций
const LOCATION_NAMES: Record<string, string> = {
  'gorno-altaysk': 'Горно-Алтайск',
  'maima': 'Майма',
  'chemal': 'Чемал',
  'altayskoe': 'Алтайское',
  'belokurikha': 'Белокуриха',
  'other': 'Другие районы'
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default function PlotPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [plot, setPlot] = useState<LandPlot | null>(null)
  const [similarPlots, setSimilarPlots] = useState<LandPlot[]>([])
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null)
  const [contactInfo, setContactInfo] = useState<any>(null)
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null)
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        // Получаем данные участка
        const response = await fetch(`${API_URL}/plots/${id}`)
        if (response.ok) {
          const data = await response.json()
          // Форматируем данные
          const formattedPlot = {
            ...data,
            id: String(data.id),
            features: Array.isArray(data.features) ? data.features : JSON.parse(data.features || '[]'),
            communications: Array.isArray(data.communications) ? data.communications : JSON.parse(data.communications || '[]'),
            terrain: typeof data.terrain === 'object' ? data.terrain : JSON.parse(data.terrain || '{}'),
            price: Number(data.price) || 0,
            price_per_meter: Number(data.price_per_meter) || 0,
            imageUrl: data.images?.[0]?.path ? `http://localhost:8000${data.images[0].path}` : '/images/plot-placeholder.jpg',
            images: (data.images || []).map((img: any) => ({
              ...img,
              path: `http://localhost:8000${img.path}`
            }))
          }
          setPlot(formattedPlot)

          // Получаем похожие участки
          const similarResponse = await fetch(`${API_URL}/plots?limit=3&location=${formattedPlot.location}`)
          if (similarResponse.ok) {
            const similarData = await similarResponse.json()
            const formattedSimilarPlots = similarData
              .filter((p: any) => p.id !== formattedPlot.id)
              .map((p: any) => ({
                ...p,
                id: String(p.id),
                features: Array.isArray(p.features) ? p.features : JSON.parse(p.features || '[]'),
                communications: Array.isArray(p.communications) ? p.communications : JSON.parse(p.communications || '[]'),
                terrain: typeof p.terrain === 'object' ? p.terrain : JSON.parse(p.terrain || '{}'),
                price: Number(p.price) || 0,
                price_per_meter: Number(p.price_per_meter) || 0,
                imageUrl: p.images?.[0]?.path ? `http://localhost:8000${p.images[0].path}` : '/images/plot-placeholder.jpg',
                images: (p.images || []).map((img: any) => ({
                  ...img,
                  path: `http://localhost:8000${img.path}`
                }))
              }))
            setSimilarPlots(formattedSimilarPlots)
          }
        }
      } catch (error) {
        console.error('Error fetching plot data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlotData()
  }, [id])

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const data = await api.get('/contacts')
        setContactInfo(data)
      } catch (error) {
        console.error('Error fetching contact info:', error)
      }
    }
    fetchContactInfo()
  }, [])

  if (loading || !plot) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-20">
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const allImages = plot.images.map(img => img.path)

  const downloadFile = async (url: string, filename: string) => {
    try {
      // Извлекаем путь файла из URL
      const filePath = url.replace('/uploads/', '');
      
      // Используем новый эндпоинт для скачивания
      const response = await fetch(`${API_URL}/download/${filePath}`);
      
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

  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return '0'
    return price.toLocaleString('ru-RU')
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-16 md:pt-20">
        {/* Gallery Section */}
        <section className="bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="mb-8">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Назад
              </button>
            </div>

            <ImageGallery 
              images={allImages} 
              title={plot.title} 
            />
          </div>
        </section>

        {/* Модальное окно для полноэкранного просмотра */}
        <Transition show={!!fullscreenImage} as={Fragment}>
          <Dialog 
            as="div" 
            className="fixed inset-0 z-50"
            onClose={() => setFullscreenImage(null)}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden transition-all">
                  <div className="relative">
                    {fullscreenImage && (
                      <div className="relative h-[80vh]">
                        <Image
                          src={fullscreenImage}
                          alt="Полноэкранное изображение"
                          fill
                          className="object-contain"
                        />
                      </div>
                    )}
                    <button
                      onClick={() => setFullscreenImage(null)}
                      className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Content Section */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <ScrollAnimation>
                  {/* Основная информация */}
                  <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <MapPinIcon className="w-5 h-5" />
                      <span>{LOCATION_NAMES[plot.location] || plot.location}, {plot.region}</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4">{plot.title}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className={`status-badge ${
                        plot.status === 'available' ? 'status-available' :
                        plot.status === 'reserved' ? 'status-reserved' :
                        'status-sold'
                      }`}>
                        {plot.status === 'available' ? 'Свободен' :
                         plot.status === 'reserved' ? 'Забронирован' : 'Продан'}
                      </span>
                      <span className="text-gray-600">
                        Категория: {plot.land_category}
                      </span>
                      <span className="text-gray-600">
                        Площадь: {plot.area} м²
                      </span>
                    </div>
                  </div>

                  {/* Описание */}
                  <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="w-6 h-6 text-green-600" />
                      Описание участка
                    </h2>
                    <div className="prose prose-sm max-w-none mb-6">
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                        {typeof plot.description === 'string' ? plot.description : plot.description.text}
                      </p>
                    </div>
                    {typeof plot.description === 'object' && plot.description.attachments?.length > 0 && (
                      <div className="mt-6 border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Прикрепленные файлы
                        </h3>
                        <div className="grid gap-3">
                          {plot.description.attachments.map((file, index) => (
                            <div
                              key={index}
                              className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all group"
                            >
                              <DocumentTextIcon className="w-6 h-6 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 font-medium flex-grow min-w-0 truncate mr-2">
                                {file.name}
                              </span>
                              <button
                                onClick={() => downloadFile(file.url, file.name)}
                                className="text-primary hover:text-primary-dark p-2 rounded-full hover:bg-white transition-all ml-auto mt-2 sm:mt-0"
                                title="Скачать файл"
                              >
                                <ArrowDownTrayIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Характеристики участка */}
                  <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                      <DocumentTextIcon className="w-6 h-6 text-green-600" />
                      Характеристики
                    </h2>
                    <div className="space-y-8">
                      {/* Кадастровый номер */}
                      <div className="bg-gray-50 p-6 rounded-xl">
                        <h3 className="text-lg font-semibold mb-4">Кадастровые номера</h3>
                        <div className="space-y-4">
                          {plot.cadastral_numbers.map((number, index) => (
                            <div key={index} className="flex items-center justify-between gap-4 flex-wrap">
                              <span className="text-xl font-medium text-gray-900">{number}</span>
                              <a 
                                href={`https://pkk.rosreestr.ru/#/search/${number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors"
                              >
                                <span>Посмотреть на карте Росреестра</span>
                                <ArrowRightIcon className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Площадь */}
                      <div>
                        <h3 className="font-semibold mb-2">Площадь участка</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Площадь</div>
                            <div className="text-xl font-medium">{plot.area} м²</div>
                          </div>
                          {plot.specified_area && (
                            <div>
                              <div className="text-sm text-gray-500">Уточненная</div>
                              <div className="text-xl font-medium">{plot.specified_area} м²</div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Категория земель */}
                      <div>
                        <h3 className="font-semibold mb-2">Категория земель</h3>
                        <span className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                          {plot.land_category}
                        </span>
                      </div>

                      {/* Разрешенное использование */}
                      <div>
                        <h3 className="font-semibold mb-2">Виды разрешенного использования(ВРИ)</h3>
                        <span className="text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                          {plot.permitted_use}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Характеристики */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <BoltIcon className="w-6 h-6 text-green-600" />
                        Коммуникации
                      </h2>
                      <ul className="space-y-3">
                        {plot.communications.map((comm, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            {comm}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-8">
                      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                        Особенности
                      </h2>
                      <ul className="space-y-3">
                        {plot.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-gray-600">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </ScrollAnimation>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  <ScrollAnimation>
                    {/* Цена и контакты */}
                    <div className="bg-white rounded-xl shadow-sm p-8">
                      <div className="mb-6">
                        <p className="text-3xl font-bold text-green-600 mb-2">
                          {plot.price ? plot.price.toLocaleString('ru-RU') : '0'} ₽
                        </p>
                        <p className="text-gray-600">
                          {plot.price_per_meter ? plot.price_per_meter.toLocaleString('ru-RU') : '0'} ₽ за м²
                        </p>
                      </div>

                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Площадь участка:</span>
                          <span className="font-medium">{plot.area} м²</span>
                        </div>
                        {plot.specified_area && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Уточненная площадь:</span>
                            <span className="font-medium">{plot.specified_area} м²</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-600">Стоимость за м²:</span>
                          <span className="font-medium">{formatPrice(plot.price_per_meter)} ₽</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {contactInfo && (
                          <>
                            <a
                              href={`tel:${contactInfo.phone}`}
                              className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                              <PhoneIcon className="w-5 h-5" />
                              <span>{contactInfo.phone ? formatPhoneNumber(contactInfo.phone) : ''}</span>
                            </a>
                            <div className="grid grid-cols-2 gap-4">
                              {contactInfo.social_links.whatsapp.enabled && (
                                <a
                                  href={`https://wa.me/${contactInfo.social_links.whatsapp.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                  <span>WhatsApp</span>
                                </a>
                              )}
                              {contactInfo.social_links.telegram.enabled && (
                                <a
                                  href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-secondary flex items-center justify-center gap-2"
                                >
                                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                  </svg>
                                  <span>Telegram</span>
                                </a>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </ScrollAnimation>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Похожие участки */}
        {similarPlots.length > 0 && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4">
              <h2 className="section-title">Похожие участки</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {similarPlots.map((similarPlot) => (
                  <ScrollAnimation key={similarPlot.id}>
                    <LandPlotCard
                      plot={similarPlot}
                      onQuickView={() => setSelectedPlot(similarPlot)}
                    />
                  </ScrollAnimation>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <Footer />
      </main>
    </>
  )
} 