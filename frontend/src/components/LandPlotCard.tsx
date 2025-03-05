'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPinIcon, ArrowsPointingOutIcon, Square2StackIcon, ChevronDoubleUpIcon, EyeIcon, TagIcon, IdentificationIcon } from '@heroicons/react/24/outline'
import { LandPlot } from '@/types/land-plot'

// Словарь для отображения названий локаций
const LOCATION_NAMES: Record<string, string> = {
  'gorno-altaysk': 'Горно-Алтайск',
  'maima': 'Майма',
  'chemal': 'Чемал',
  'altayskoe': 'Алтайское',
  'belokurikha': 'Белокуриха',
  'other': 'Другие районы'
}

interface LandPlotCardProps {
  plot: LandPlot
  viewMode?: 'grid' | 'list'
  onQuickView: (plot: LandPlot) => void
}

export default function LandPlotCard({ plot, viewMode = 'grid', onQuickView }: LandPlotCardProps) {
  const formatPrice = (price: number | undefined) => {
    if (typeof price !== 'number') return '0'
    return price.toLocaleString('ru-RU')
  }

  // Получаем информацию о кадастровых номерах для отображения в карточке
  const getCadastralInfo = () => {
    if (!plot.cadastral_numbers || plot.cadastral_numbers.length === 0) {
      return 'Не указан'
    }
    if (plot.cadastral_numbers.length === 1) {
      return plot.cadastral_numbers[0]
    }
    return `${plot.cadastral_numbers[0]} +${plot.cadastral_numbers.length - 1}`
  }

  const getStatusBadge = () => {
    switch (plot.status) {
      case 'available':
        return <span className="absolute top-2 right-2 md:top-4 md:right-4 px-2 py-0.5 md:px-3 md:py-1 bg-green-500 text-white text-xs md:text-sm font-medium rounded-full z-10">Доступен</span>
      case 'reserved':
        return <span className="absolute top-2 right-2 md:top-4 md:right-4 px-2 py-0.5 md:px-3 md:py-1 bg-yellow-500 text-white text-xs md:text-sm font-medium rounded-full z-10">Забронирован</span>
      case 'sold':
        return <span className="absolute top-2 right-2 md:top-4 md:right-4 px-2 py-0.5 md:px-3 md:py-1 bg-red-500 text-white text-xs md:text-sm font-medium rounded-full z-10">Продан</span>
      default:
        return null
    }
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {/* Изображение как ссылка */}
          <Link 
            href={`/catalog/${plot.id}`}
            className="relative md:w-72 lg:w-80 flex-shrink-0 block group"
          >
            <div className="aspect-[4/3] md:h-full relative overflow-hidden">
              <Image
                src={plot.images[0]?.path || '/images/plot-placeholder.jpg'}
                alt={plot.title}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {getStatusBadge()}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
            </div>
            {/* Кнопка быстрого просмотра */}
            <button
              onClick={(e) => {
                e.preventDefault() // Предотвращаем переход по ссылке
                onQuickView(plot)
              }}
              className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white/90 p-1.5 md:p-2 rounded-lg shadow-lg hover:bg-white transition-colors z-10"
              title="Быстрый просмотр"
            >
              <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </Link>

          {/* Контент */}
          <div className="flex-1 p-3 md:p-4 lg:p-5 flex flex-col">
            {/* Локация */}
            <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
              <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-primary/70" />
              <span className="truncate">{LOCATION_NAMES[plot.location] || plot.location}</span>
            </div>

            {/* Заголовок как ссылка */}
            <Link 
              href={`/catalog/${plot.id}`}
              className="block mb-1 md:mb-2 text-base md:text-lg lg:text-xl font-semibold text-gray-900 hover:text-primary transition-colors"
            >
              <h3 className="line-clamp-2">{plot.title}</h3>
            </Link>

            {/* Характеристики */}
            <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-3">
              <div className="flex items-center gap-1 md:gap-2">
                <Square2StackIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
                <span className="text-xs md:text-sm">{plot.area} м²</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <TagIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
                <span className="text-xs md:text-sm truncate">{plot.land_category}</span>
              </div>
            </div>

            {/* Кадастровый номер */}
            <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
              <IdentificationIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
              <span className="text-xs md:text-sm font-medium">{getCadastralInfo()}</span>
            </div>

            {/* Цена */}
            <div className="mt-auto">
              <p className="text-xl md:text-2xl lg:text-3xl font-bold text-primary">
                {formatPrice(plot.price)} ₽
              </p>
              <p className="text-xs md:text-sm text-gray-500">
                {formatPrice(plot.price_per_meter)} ₽/м²
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full border border-gray-100">
      {/* Изображение как ссылка */}
      <Link 
        href={`/catalog/${plot.id}`}
        className="relative block group"
      >
        <div className="aspect-[4/3] overflow-hidden">
          <Image
            src={plot.images[0]?.path || '/images/plot-placeholder.jpg'}
            alt={plot.title}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
        </div>
        {getStatusBadge()}
        {/* Кнопка быстрого просмотра */}
        <button
          onClick={(e) => {
            e.preventDefault() // Предотвращаем переход по ссылке
            onQuickView(plot)
          }}
          className="absolute bottom-1 right-1 md:bottom-2 md:right-2 bg-white/90 p-1.5 md:p-2 rounded-lg shadow-lg hover:bg-white transition-colors z-10"
          title="Быстрый просмотр"
        >
          <EyeIcon className="w-4 h-4 md:w-5 md:h-5" />
        </button>
      </Link>

      {/* Контент */}
      <div className="p-3 md:p-4 lg:p-5 flex flex-col flex-grow">
        <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500 mb-1 md:mb-2">
          <MapPinIcon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0 text-primary/70" />
          <span className="truncate">{LOCATION_NAMES[plot.location] || plot.location}</span>
        </div>

        {/* Заголовок как ссылка */}
        <Link 
          href={`/catalog/${plot.id}`}
          className="block mb-1 md:mb-2 text-base md:text-lg font-semibold text-gray-900 hover:text-primary transition-colors"
        >
          <h3 className="line-clamp-2">{plot.title}</h3>
        </Link>

        <div className="grid grid-cols-2 gap-2 md:gap-4 mb-2 md:mb-3">
          <div className="flex items-center gap-1 md:gap-2">
            <Square2StackIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
            <span className="text-xs md:text-sm">{plot.area} м²</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <TagIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
            <span className="text-xs md:text-sm truncate">{plot.land_category}</span>
          </div>
        </div>

        {/* Кадастровый номер */}
        <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
          <IdentificationIcon className="w-4 h-4 md:w-5 md:h-5 text-primary/70" />
          <span className="text-xs md:text-sm font-medium">{getCadastralInfo()}</span>
        </div>

        <div className="mt-auto">
          <p className="text-xl md:text-2xl font-bold text-primary">
            {formatPrice(plot.price)} ₽
          </p>
          <p className="text-xs md:text-sm text-gray-500">
            {formatPrice(plot.price_per_meter)} ₽/м²
          </p>
        </div>
      </div>
    </div>
  )
} 