'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AdminHeader from './AdminHeader'
import { ReactNode } from 'react'

interface AdminLayoutProps {
  children: ReactNode
  title?: string
}

const MENU_ITEMS = [
  { href: '/admin/dashboard', label: 'Главная', icon: 'home' },
  { href: '/admin/plots', label: 'Участки', icon: 'plots' },
  { href: '/admin/requests', label: 'Заявки', icon: 'requests' },
  { href: '/admin/quiz', label: 'Квиз', icon: 'quiz' },
  { href: '/admin/contacts', label: 'Контакты', icon: 'contacts' },
]

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLayoutReady, setIsLayoutReady] = useState(false)
  const pathname = usePathname()

  // Используем хук для определения ширины экрана
  const [screenWidth, setScreenWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  // Инициализация и обработка изменения размера окна
  useEffect(() => {
    // Функция для определения, должен ли сайдбар быть открыт по умолчанию
    const shouldSidebarBeOpen = () => {
      // Получаем сохраненное состояние из localStorage
      const savedState = localStorage.getItem('adminSidebarOpen')
      
      // По умолчанию на desktop открыт, на мобильных закрыт
      if (window.innerWidth >= 768) {
        return savedState !== null ? savedState === 'true' : true
      } else {
        return false
      }
    }

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
      // Автоматически управляем сайдбаром только при первоначальной загрузке
      // или значительном изменении размера окна
      if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    // Инициализируем состояние сайдбара
    if (!isLayoutReady) {
      setIsSidebarOpen(shouldSidebarBeOpen())
      setIsLayoutReady(true)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isSidebarOpen, isLayoutReady])

  // Сохраняем состояние сайдбара при изменении
  useEffect(() => {
    if (isLayoutReady) {
      localStorage.setItem('adminSidebarOpen', String(isSidebarOpen))
    }
  }, [isSidebarOpen, isLayoutReady])

  const getIcon = (name: string) => {
    switch (name) {
      case 'home':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        )
      case 'quiz':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'requests':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        )
      case 'plots':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        )
      case 'contacts':
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Функция для закрытия сайдбара на мобильных устройствах при клике на ссылку
  const handleLinkClick = () => {
    if (screenWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  if (!isLayoutReady) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Затемнение фона при открытом меню на мобильных устройствах */}
      {isSidebarOpen && screenWidth < 768 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
      
      {/* Хедер (вынесен из основного контента наверх) */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md" style={{zIndex: 9999}}>
        <div className="flex items-center justify-between h-16 px-4 md:px-8">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
              aria-label="Меню"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="ml-3 text-lg md:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 p-2"
              aria-label="На сайт"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Сайдбар с предустановленными размерами */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out pt-16 will-change-transform`} 
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary text-white">
          <span className="text-xl font-semibold truncate">Админ-панель</span>
        </div>
        <nav className="px-4 py-6 overflow-y-auto max-h-[calc(100vh-8rem)]"> 
          <ul className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 ${
                    pathname?.startsWith(item.href) ? 'bg-gray-100' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="mr-3 text-gray-500">{getIcon(item.icon)}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Основной контент с фиксированной шириной отступа */}
      <div 
        className={`transition-all duration-300 ease-in-out min-h-screen pt-16 ${
          isSidebarOpen ? 'md:pl-64' : 'pl-0'
        }`}
        style={{ width: "100%" }}
      >
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
} 