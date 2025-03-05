'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatPhoneNumber } from '@/utils/formatters'
import { PhoneIcon, EnvelopeIcon, ClockIcon } from '@heroicons/react/24/outline'
import { useContacts } from '@/utils/useContacts'

export default function Footer() {
  const { contactInfo } = useContacts()

  return (
    <footer className="bg-gray-900 text-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Логотип и описание */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-6">
              <div className="relative w-8 h-8 md:w-10 md:h-10">
                <div className="absolute inset-0 bg-white rounded-full"></div>
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src="/images/logo.png"
                    alt="ЗемлиАлтая"
                    fill
                    className="object-contain p-1"
                  />
                </div>
              </div>
              <span className="font-bold text-base md:text-xl">
                ЗемлиАлтая
              </span>
            </Link>
            <p className="text-gray-400 text-sm md:text-base max-w-md">
              Мы помогаем приобрести нашим партнерам земельные участки для строительства турбаз, отелей и частных домов в живописных местах Горного Алтая.
            </p>
            
            {/* Социальные сети для мобильных устройств */}
            <div className="mt-4 sm:mt-6 lg:hidden">
              <h4 className="text-sm font-semibold mb-2 text-gray-300">Мы в соцсетях:</h4>
              <div className="flex space-x-3">
                {contactInfo?.social_links?.whatsapp?.enabled && (
                  <a 
                    href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                    title="WhatsApp"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                    </svg>
                  </a>
                )}
                {contactInfo?.social_links?.telegram?.enabled && (
                  <a 
                    href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                    title="Telegram"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                    </svg>
                  </a>
                )}
                {contactInfo?.social_links?.vk?.enabled && (
                  <a 
                    href={`https://vk.com/${contactInfo.social_links.vk.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    title="ВКонтакте"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z"></path>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          {/* Навигация */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Навигация</h3>
            <ul className="space-y-1 md:space-y-2">
              <li>
                <Link href="/" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Каталог участков
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contacts" className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">Контакты</h3>
            <ul className="space-y-2 md:space-y-3">
              {contactInfo?.phone && (
                <li className="flex items-center">
                  <PhoneIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0" />
                  <a href={`tel:${contactInfo.phone}`} className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                    {formatPhoneNumber(contactInfo.phone)}
                  </a>
                </li>
              )}
              {contactInfo?.email && (
                <li className="flex items-center">
                  <EnvelopeIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0" />
                  <a href={`mailto:${contactInfo.email}`} className="text-sm md:text-base text-gray-400 hover:text-white transition-colors">
                    {contactInfo.email}
                  </a>
                </li>
              )}
              {contactInfo?.work_hours && (
                <li className="flex items-start">
                  <ClockIcon className="w-4 h-4 md:w-5 md:h-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm md:text-base text-gray-400">
                    Режим работы:<br />
                    Пн-Пт: {contactInfo.work_hours.monday_friday}<br />
                    Сб-Вс: {contactInfo.work_hours.saturday_sunday}
                  </div>
                </li>
              )}
            </ul>
            
            {/* Социальные сети для десктопа */}
            {(contactInfo?.social_links?.whatsapp?.enabled || 
              contactInfo?.social_links?.telegram?.enabled || 
              contactInfo?.social_links?.vk?.enabled) && (
              <div className="mt-4 hidden lg:block">
                <h4 className="text-sm font-semibold mb-2 text-gray-300">Мы в соцсетях:</h4>
                <div className="flex space-x-3">
                  {contactInfo?.social_links?.whatsapp?.enabled && (
                    <a 
                      href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white hover:bg-green-700 transition-colors"
                      title="WhatsApp"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                      </svg>
                    </a>
                  )}
                  {contactInfo?.social_links?.telegram?.enabled && (
                    <a 
                      href={`https://t.me/${contactInfo.social_links.telegram.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
                      title="Telegram"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"></path>
                      </svg>
                    </a>
                  )}
                  {contactInfo?.social_links?.vk?.enabled && (
                    <a 
                      href={`https://vk.com/${contactInfo.social_links.vk.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      title="ВКонтакте"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21.547 7h-3.29a.743.743 0 0 0-.655.392s-1.312 2.416-1.734 3.23C14.734 12.813 14 12.126 14 11.11V7.603A1.104 1.104 0 0 0 12.896 6.5h-2.474a1.982 1.982 0 0 0-1.75.813s1.255-.204 1.255 1.49c0 .42.022 1.626.04 2.64a.73.73 0 0 1-1.272.503 21.54 21.54 0 0 1-2.498-4.543.693.693 0 0 0-.63-.403h-2.99a.508.508 0 0 0-.48.685C3.005 10.175 6.918 18 11.38 18h1.878a.742.742 0 0 0 .742-.742v-1.135a.73.73 0 0 1 1.23-.53l2.247 2.112a1.09 1.09 0 0 0 .746.295h2.953c1.424 0 1.424-.988.647-1.753-.546-.538-2.518-2.617-2.518-2.617a1.02 1.02 0 0 1-.078-1.323c.637-.84 1.68-2.212 2.122-2.8.603-.804 1.697-2.507.197-2.507z"></path>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Копирайт */}
        <div className="pt-6 md:pt-8 border-t border-gray-800 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()} ЗемлиАлтая. Все права защищены.
            </p>
            <div className="mt-2 sm:mt-0">
              <Link href="/privacy" className="text-xs md:text-sm text-gray-500 hover:text-gray-400 transition-colors">
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 
