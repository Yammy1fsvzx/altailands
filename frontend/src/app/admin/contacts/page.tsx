'use client'

import { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { toast } from 'react-hot-toast'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { api } from '@/utils/api'

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
  const [saving, setSaving] = useState(false)
  const [contactInfo, setContactInfo] = useState<ContactInfo>(initialContactInfo)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const data = await api.get('/contacts')
      setContactInfo(data || initialContactInfo)
    } catch (error) {
      console.error('Error fetching contact info:', error)
      toast.error('Ошибка при загрузке контактной информации')
      setContactInfo(initialContactInfo)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactInfo) return

    setSaving(true)
    try {
      await api.put('/contacts', contactInfo, { isAdmin: true })
      toast.success('Контактная информация успешно обновлена')
      await fetchContactInfo() // Обновляем данные после сохранения
    } catch (error) {
      console.error('Error updating contact info:', error)
      toast.error('Ошибка при обновлении контактной информации')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    section?: 'work_hours' | 'social_links',
    field?: string
  ) => {
    const { name, value } = e.target

    if (section && field) {
      setContactInfo(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setContactInfo(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleSocialLinkChange = (
    network: keyof SocialLinks,
    field: keyof SocialLink,
    value: string | boolean
  ) => {
    setContactInfo(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [network]: {
          ...prev.social_links[network],
          [field]: value
        }
      }
    }))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Контакты">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-gray-400" />
              {showPreview ? 'Скрыть предпросмотр' : 'Показать предпросмотр'}
            </button>
            <button
              type="button"
              onClick={fetchContactInfo}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <ArrowPathIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2 text-gray-400" />
              Обновить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Форма редактирования */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-4 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6 sm:mb-8">
                Редактирование информации
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Основная информация */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Телефон
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="phone"
                        id="phone"
                        value={contactInfo?.phone || ''}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="+7 (XXX) XXX-XX-XX"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={contactInfo?.email || ''}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Адрес офиса
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={contactInfo?.address || ''}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="г. Горно-Алтайск, ул. Примерная, д. 1"
                      />
                    </div>
                  </div>
                </div>

                {/* Режим работы */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    Режим работы
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="monday_friday" className="block text-sm font-medium text-gray-700">
                        Понедельник-Пятница
                      </label>
                      <input
                        type="text"
                        id="monday_friday"
                        value={contactInfo?.work_hours.monday_friday || ''}
                        onChange={(e) => handleInputChange(e, 'work_hours', 'monday_friday')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="9:00 - 18:00"
                      />
                    </div>

                    <div>
                      <label htmlFor="saturday_sunday" className="block text-sm font-medium text-gray-700">
                        Суббота-Воскресенье
                      </label>
                      <input
                        type="text"
                        id="saturday_sunday"
                        value={contactInfo?.work_hours.saturday_sunday || ''}
                        onChange={(e) => handleInputChange(e, 'work_hours', 'saturday_sunday')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        placeholder="10:00 - 16:00"
                      />
                    </div>
                  </div>
                </div>

                {/* Социальные сети */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">
                    Социальные сети
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="whatsapp-toggle" className="block text-sm font-medium text-gray-700">
                          WhatsApp
                        </label>
                        <div className="relative">
                          <input
                            id="whatsapp-toggle"
                            type="checkbox"
                            checked={contactInfo?.social_links.whatsapp.enabled}
                            onChange={(e) => handleSocialLinkChange('whatsapp', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </div>
                      </div>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm">
                          +7
                        </span>
                        <input
                          type="text"
                          id="whatsapp"
                          disabled={!contactInfo?.social_links.whatsapp.enabled}
                          value={contactInfo?.social_links.whatsapp.username}
                          onChange={(e) => handleSocialLinkChange('whatsapp', 'username', e.target.value)}
                          className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="9991234567"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="telegram-toggle" className="block text-sm font-medium text-gray-700">
                          Telegram
                        </label>
                        <div className="relative">
                          <input
                            id="telegram-toggle"
                            type="checkbox"
                            checked={contactInfo?.social_links.telegram.enabled}
                            onChange={(e) => handleSocialLinkChange('telegram', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </div>
                      </div>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          id="telegram"
                          disabled={!contactInfo?.social_links.telegram.enabled}
                          value={contactInfo?.social_links.telegram.username}
                          onChange={(e) => handleSocialLinkChange('telegram', 'username', e.target.value)}
                          className="pl-8 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="username"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="vk-toggle" className="block text-sm font-medium text-gray-700">
                          VKontakte
                        </label>
                        <div className="relative">
                          <input
                            id="vk-toggle"
                            type="checkbox"
                            checked={contactInfo?.social_links.vk.enabled}
                            onChange={(e) => handleSocialLinkChange('vk', 'enabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </div>
                      </div>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-sm">
                          vk.com/
                        </span>
                        <input
                          type="text"
                          id="vk"
                          disabled={!contactInfo?.social_links.vk.enabled}
                          value={contactInfo?.social_links.vk.username}
                          onChange={(e) => handleSocialLinkChange('vk', 'username', e.target.value)}
                          className="pl-16 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm disabled:bg-gray-100 disabled:text-gray-500"
                          placeholder="username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 sm:pt-5">
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Предпросмотр */}
          {showPreview && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-4 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-6 sm:mb-8">
                  Предпросмотр
                </h3>

                <div className="space-y-6 sm:space-y-8">
                  {/* Основная информация */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <PhoneIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                        <a 
                          href={`tel:${contactInfo?.phone}`}
                          className="text-base sm:text-xl text-green-600 hover:text-green-700 transition-colors"
                        >
                          {contactInfo?.phone}
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          Звоните нам по любым вопросам
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                        <a 
                          href={`mailto:${contactInfo?.email}`}
                          className="text-base sm:text-xl text-green-600 hover:text-green-700 transition-colors break-all"
                        >
                          {contactInfo?.email}
                        </a>
                        <p className="text-sm text-gray-600 mt-1">
                          Ответим в течение 24 часов
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPinIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Адрес офиса</h3>
                        <p className="text-base sm:text-xl text-gray-900">
                          {contactInfo?.address}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Удобная парковка для клиентов
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">Режим работы</h3>
                        <div className="space-y-1">
                          <p className="text-gray-900">Пн-Пт: {contactInfo?.work_hours.monday_friday}</p>
                          <p className="text-gray-900">Сб-Вс: {contactInfo?.work_hours.saturday_sunday}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Работаем без перерыва
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Социальные сети */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Мы в социальных сетях
                    </h3>
                    <div className="flex flex-wrap gap-4">
                      {contactInfo?.social_links.whatsapp.enabled && (
                        <a 
                          href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                        </a>
                      )}
                      {contactInfo?.social_links.telegram.enabled && (
                        <a 
                          href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                          </svg>
                        </a>
                      )}
                      {contactInfo?.social_links.vk.enabled && (
                        <a 
                          href={`https://vk.com/${contactInfo.social_links.vk.username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-xl flex items-center justify-center hover:bg-primary/10 transition-colors"
                        >
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.408 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.203c0 .422-.134.677-1.252.677-1.846 0-3.896-1.118-5.339-3.202-2.17-3.037-2.76-5.31-2.76-5.78 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.677.863 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.76c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.252-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.745-.576.745z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Информация об обновлении */}
                  {contactInfo?.updated_at && (
                    <div className="text-xs sm:text-sm text-gray-500">
                      Последнее обновление: {new Date(contactInfo.updated_at).toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
} 