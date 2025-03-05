'use client'

import { useState, useEffect } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollAnimation from '@/components/ScrollAnimation'
import { 
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { formatPhoneNumber } from '@/utils/formatters'
import Script from 'next/script'
import { api } from '@/utils/api'
import { API_URL } from '@/config/api'

interface WorkHours {
  monday_friday: string
  saturday_sunday: string
}

interface SocialLink {
  enabled: boolean
  username: string
}

interface SocialLinks {
  whatsapp: SocialLink
  telegram: SocialLink
  vk: SocialLink
}

interface ContactInfo {
  id: number
  phone: string
  email: string
  address: string
  work_hours: WorkHours
  social_links: SocialLinks
  updated_at: string
}

// Функция для кодирования адреса для URL
const encodeAddress = (address: string) => {
  return encodeURIComponent(address)
}

const initialContactInfo: ContactInfo = {
  id: 0,
  phone: '',
  email: '',
  address: '',
  work_hours: {
    monday_friday: '',
    saturday_sunday: ''
  },
  social_links: {
    whatsapp: { enabled: false, username: '' },
    telegram: { enabled: false, username: '' },
    vk: { enabled: false, username: '' }
  },
  updated_at: new Date().toISOString()
}

export default function ContactsPage() {
  const [loading, setLoading] = useState(true)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  useEffect(() => {
    if (mapLoaded && contactInfo.address) {
      // @ts-ignore
      const ymaps = window.ymaps
      ymaps.ready(() => {
        // Сначала создаем геокодер для получения координат по адресу
        const geocoder = ymaps.geocode(contactInfo.address)
        geocoder.then((res: any) => {
          const coordinates = res.geoObjects.get(0).geometry.getCoordinates()
          
          // Создаем карту уже с полученными координатами
          const map = new ymaps.Map('map', {
            center: coordinates,
            zoom: 17
          })
          
          // Создаем метку
          const placemark = new ymaps.Placemark(coordinates, {
            balloonContent: contactInfo.address
          }, {
            preset: 'islands#greenDotIconWithCaption'
          })
          
          map.geoObjects.add(placemark)
          
          // Добавляем элементы управления
          map.controls.remove('trafficControl')
          map.controls.remove('searchControl')
          map.controls.remove('typeSelector')
          map.controls.remove('fullscreenControl')
          map.controls.remove('rulerControl')
          map.behaviors.disable(['scrollZoom'])
        })
      })
    }
  }, [mapLoaded, contactInfo.address])

  const fetchContactInfo = async () => {
    try {
      const data = await api.get('/contacts')
      setContactInfo(data || initialContactInfo)
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/admin/requests/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          type: 'contact_form'
        }),
      })

      if (response.ok) {
        setShowSuccess(true)
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: ''
        })
        
        // Скрываем сообщение об успехе через 5 секунд
        setTimeout(() => {
          setShowSuccess(false)
        }, 5000)
      } else {
        throw new Error('Failed to submit form')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Head>
          <title>Контакты</title>
        </Head>
        <Script 
          src="https://api-maps.yandex.ru/2.1/?apikey=ваш_API_ключ&lang=ru_RU" 
          onLoad={() => setMapLoaded(true)}
        />
        <Header />
        <main className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Контакты</title>
      </Head>
      <Script 
        src="https://api-maps.yandex.ru/2.1/?apikey=0d548291-a59d-48f7-9490-ce8a53b23151&lang=ru_RU" 
        onLoad={() => setMapLoaded(true)}
      />
      <Header />
      <main className="min-h-screen pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="min-h-[60vh] bg-gradient-to-b from-primary/5 via-primary/5 to-white flex items-center">
          <div className="max-w-7xl mx-auto px-4 py-32">
            <ScrollAnimation>
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                  Свяжитесь с нами
                </h1>
                <p className="text-xl text-gray-600">
                  Наши специалисты всегда готовы ответить на ваши вопросы и помочь с выбором идеального участка
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        {/* Основная информация */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Контактная информация */}
              <ScrollAnimation>
                <div className="space-y-12">
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                      Контактная информация
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <PhoneIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                          <a 
                            href={`tel:${contactInfo?.phone}`}
                            className="text-xl text-primary hover:text-primary-dark transition-colors"
                          >
                            {contactInfo?.phone ? formatPhoneNumber(contactInfo.phone) : ''}
                          </a>
                          <p className="text-gray-600 mt-1">
                            Звоните нам по любым вопросам
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <EnvelopeIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                          <a 
                            href={`mailto:${contactInfo?.email}`}
                            className="text-xl text-primary hover:text-primary-dark transition-colors"
                          >
                            {contactInfo?.email}
                          </a>
                          <p className="text-gray-600 mt-1">
                            Ответим в течение 24 часов
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <MapPinIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Адрес офиса</h3>
                          <p className="text-xl text-gray-900">
                            {contactInfo?.address}
                          </p>
                          <p className="text-gray-600 mt-1">
                            Удобная парковка для клиентов
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                          <ClockIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">Режим работы</h3>
                          <div className="space-y-1">
                            <p className="text-gray-900">Пн-Пт: {contactInfo?.work_hours.monday_friday}</p>
                            <p className="text-gray-900">Сб-Вс: {contactInfo?.work_hours.saturday_sunday}</p>
                          </div>
                          <p className="text-gray-600 mt-1">
                            Работаем без перерыва
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Социальные сети */}
                  <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                      Мы в социальных сетях
                    </h2>
                    <div className="flex gap-4">
                      {contactInfo?.social_links.whatsapp.enabled && (
                        <a 
                          href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                      {contactInfo?.social_links.telegram.enabled && (
                        <a 
                          href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </a>
                      )}
                      {contactInfo?.social_links.vk.enabled && (
                        <a 
                          href={`https://vk.com/${contactInfo.social_links.vk.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.203c0 .422-.134.677-1.252.677-1.846 0-3.896-1.118-5.339-3.202-2.17-3.037-2.76-5.31-2.76-5.78 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.76c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.252-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.745-.576.745z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollAnimation>

              {/* Форма обратной связи */}
              <ScrollAnimation>
                <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/5">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">
                    Напишите нам
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Ваше имя
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="Иван Иванов"
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Телефон
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="form-input"
                          placeholder="+7 (XXX) XXX-XX-XX"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="example@mail.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Сообщение
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={4}
                        className="form-input"
                        placeholder="Ваше сообщение..."
                      ></textarea>
                    </div>

                    {/* Сообщение об успешной отправке */}
                    {showSuccess && (
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-4 rounded-lg animate-fade-in">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>Ваше сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`btn-primary w-full justify-center ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Отправка...
                        </span>
                      ) : (
                        'Отправить сообщение'
                      )}
                    </button>
                  </form>
                </div>
              </ScrollAnimation>
            </div>
          </div>
        </section>

        {/* Карта */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <ScrollAnimation>
              <div className="max-w-3xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">
                  Как нас найти
                </h2>
              </div>
            </ScrollAnimation>
            <ScrollAnimation>
              <div className="relative h-[400px] rounded-xl overflow-hidden shadow-sm border border-primary/5">
                <div id="map" className="w-full h-full"></div>
              </div>
            </ScrollAnimation>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
} 