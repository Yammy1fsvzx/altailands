'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { 
  Bars3Icon, 
  XMarkIcon, 
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { formatPhoneNumber } from '@/utils/formatters'
import { useContacts, ContactInfo } from '@/utils/useContacts'

const NAV_LINKS = [
  { name: 'Главная', href: '/' },
  { name: 'Каталог', href: '/catalog' },
  { name: 'О нас', href: '/about' },
  { name: 'Контакты', href: '/contacts' }
]

const CONTACT_LINKS = (contactInfo: ContactInfo | null) => [
  {
    name: 'Телефон',
    href: `tel:${contactInfo?.phone || ''}`,
    icon: PhoneIcon,
    text: contactInfo?.phone ? formatPhoneNumber(contactInfo.phone) : ''
  },
  ...(contactInfo?.social_links.whatsapp.enabled ? [{
    name: 'WhatsApp',
    href: `https://wa.me/7${contactInfo.social_links.whatsapp.username}`,
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    text: 'Написать в WhatsApp'
  }] : []),
  ...(contactInfo?.social_links.telegram.enabled ? [{
    name: 'Telegram',
    href: `https://t.me/${contactInfo.social_links.telegram.username}`,
    icon: () => (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
    text: 'Написать в Telegram'
  }] : [])
]

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { contactInfo } = useContacts()
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Закрываем меню при изменении пути
  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.classList.remove('mobile-menu-open')
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMenuOpen])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  // Определяем стили для шапки в зависимости от страницы и скролла
  const getHeaderStyles = () => {
    // На главной странице - прозрачная шапка, которая становится белой при скролле
    if (isHomePage) {
      return isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-3 md:py-4'
    }
    // На всех остальных страницах - всегда белая шапка
    return isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-3 md:py-4'
  }

  // Определяем стили для текста в зависимости от страницы и скролла
  const getTextStyles = (isActiveLink = false) => {
    if (isHomePage) {
      if (isScrolled || isMenuOpen) {
        // На главной при скролле или открытом меню
        return isActiveLink ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary transition-colors'
      } else {
        // На главной без скролла
        return isActiveLink ? 'text-white font-bold' : 'text-gray-100 hover:text-white transition-colors'
      }
    } else {
      // На всех остальных страницах
      return isActiveLink ? 'text-primary font-medium' : 'text-gray-700 hover:text-primary transition-colors'
    }
  }

  // Определяем стиль для логотипа
  const getLogoTextStyle = () => {
    if (isHomePage) {
      return isScrolled || isMenuOpen ? 'text-primary' : 'text-white'
    } else {
      return 'text-primary'
    }
  }

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getHeaderStyles()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Логотип */}
        <Link href="/" className="relative z-10">
          <div className="flex items-center">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mr-2"> {/* Увеличены размеры для отступов */}
              <div className="absolute inset-0 bg-white rounded-full shadow-md p-0.5 sm:p-1"> {/* Добавлен отступ для белого фона */}
                <div className="relative w-full h-full flex items-center justify-center p-1 sm:p-1.5">
                  <Image 
                    src="/images/logo.png" 
                    alt="ЗемлиАлтая" 
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            <span className={`text-base sm:text-lg md:text-xl font-bold ${getLogoTextStyle()} font-play tracking-wide`}>
              ЗемлиАлтая
            </span>
          </div>
        </Link>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm lg:text-base font-medium transition-colors ${getTextStyles(isActive(link.href))}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Контакты на десктопе */}
        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
          {contactInfo?.phone && (
            <button 
              onClick={() => {
                navigator.clipboard.writeText(contactInfo.phone);
                const notification = document.createElement('div');
                notification.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
                notification.textContent = 'Номер скопирован!';
                document.body.appendChild(notification);
                setTimeout(() => {
                  notification.remove();
                }, 2000);
              }}
              className={`btn-primary py-1 sm:py-1.5 px-2 sm:px-3 flex items-center text-xs sm:text-sm font-medium transition-all`}
              title="Нажмите, чтобы скопировать"
            >
              <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span>{formatPhoneNumber(contactInfo.phone)}</span>
            </button>
          )}
          
          {contactInfo?.social_links?.whatsapp?.enabled && (
            <a 
              href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 sm:w-9 sm:h-9 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
              title="Написать в WhatsApp"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
              </svg>
            </a>
          )}
        </div>

        {/* Кнопка мобильного меню */}
        <button
          className="md:hidden relative z-10 p-1"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          {isMenuOpen ? (
            <XMarkIcon className={`w-6 h-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
          ) : (
            <Bars3Icon className={`w-6 h-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
          )}
        </button>

        {/* Мобильное меню */}
        <div 
          className={`mobile-menu ${isMenuOpen ? 'open' : 'closed'} md:hidden`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <div className="relative w-7 h-7 sm:w-8 sm:h-8 mr-2">
                    <div className="absolute inset-0 bg-white rounded-full shadow-md"></div>
                    <div className="relative w-full h-full flex items-center justify-center p-1.5">
                      <Image 
                        src="/images/logo.png" 
                        alt="ЗемлиАлтая" 
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                  <span className="text-base sm:text-lg font-bold text-primary font-play tracking-wide">
                    ЗемлиАлтая
                  </span>
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1"
                >
                  <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
                </button>
              </div>
            </div>
            
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-3 sm:space-y-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className={`block py-1.5 sm:py-2 text-sm sm:text-base ${
                        isActive(link.href)
                          ? 'text-primary font-medium'
                          : 'text-gray-700 hover:text-primary transition-colors'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            <div className="p-4 border-t">
              <div className="space-y-3">
                {contactInfo?.phone && (
                  <a 
                    href={`tel:${contactInfo.phone}`}
                    className="flex items-center text-gray-700 hover:text-primary transition-colors"
                  >
                    <PhoneIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    <span className="text-sm sm:text-base">{formatPhoneNumber(contactInfo.phone)}</span>
                  </a>
                )}
                
                {contactInfo?.email && (
                  <a 
                    href={`mailto:${contactInfo.email}`}
                    className="flex items-center text-gray-700 hover:text-primary transition-colors"
                  >
                    <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                    <span className="text-sm sm:text-base">{contactInfo.email}</span>
                  </a>
                )}
                
                {contactInfo?.social_links?.whatsapp?.enabled && (
                  <a 
                    href={`https://wa.me/7${contactInfo.social_links.whatsapp.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    </svg>
                    <span className="text-sm sm:text-base">Написать в WhatsApp</span>
                  </a>
                )}
                
                <Link
                  href="/contacts"
                  className="btn-primary w-full justify-center mt-4 text-sm sm:text-base py-2 sm:py-2.5 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Связаться с нами
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
} 