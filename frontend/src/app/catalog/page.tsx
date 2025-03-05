'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { LandPlot, PlotStatus } from '@/types/land-plot'
import LandPlotCard from '@/components/LandPlotCard'
import PlotModal from '@/components/PlotModal'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { 
  ViewColumnsIcon, 
  ListBulletIcon,
  MapIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { api } from '@/utils/api'

type ViewMode = 'grid' | 'list'
type SortOption = 'price-asc' | 'price-desc' | 'area-asc' | 'area-desc'

interface Filters {
  search: string
  land_category: string
  priceMin: string
  priceMax: string
  areaMin: string
  areaMax: string
  region: string
  location: string
  isNearRiver: boolean
  isNearMountains: boolean
  isNearForest: boolean
  isNearLake: boolean
  hasViewOnMountains: boolean
  status: PlotStatus | ''
}

interface FilterKey {
  [key: string]: string | boolean | number | undefined
}

const INITIAL_FILTERS: Filters = {
  search: '',
  land_category: '',
  priceMin: '',
  priceMax: '',
  areaMin: '',
  areaMax: '',
  region: '',
  location: '',
  isNearRiver: false,
  isNearMountains: false,
  isNearForest: false,
  isNearLake: false,
  hasViewOnMountains: false,
  status: ''
}

const PLOT_STATUSES: PlotStatus[] = ['available', 'reserved', 'sold']

export default function CatalogPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [plots, setPlots] = useState<LandPlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlot, setSelectedPlot] = useState<LandPlot | null>(null)
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [sortOption, setSortOption] = useState<SortOption>('price-asc')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [regions, setRegions] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const ITEMS_PER_PAGE = 9

  useEffect(() => {
    // Восстанавливаем фильтры из URL при загрузке
    const urlFilters: Partial<Filters> = {}
    for (const [key, value] of searchParams.entries()) {
      const filterKey = key as keyof Filters
      if (filterKey in INITIAL_FILTERS) {
        if (filterKey === 'isNearRiver' || filterKey === 'isNearMountains' || 
            filterKey === 'isNearForest' || filterKey === 'isNearLake' || 
            filterKey === 'hasViewOnMountains') {
          urlFilters[filterKey] = value === 'true'
        } else {
          urlFilters[filterKey] = value as any
        }
      }
    }
    setFilters({ ...INITIAL_FILTERS, ...urlFilters })
    
    const urlPage = searchParams.get('page')
    if (urlPage) setPage(parseInt(urlPage))
    
    const urlSort = searchParams.get('sort')
    if (urlSort && ['price-asc', 'price-desc', 'area-asc', 'area-desc'].includes(urlSort)) {
      setSortOption(urlSort as SortOption)
    }
    
    const urlView = searchParams.get('view')
    if (urlView && ['grid', 'list'].includes(urlView)) {
      setViewMode(urlView as ViewMode)
    }
  }, [])

  // Добавляем функцию для загрузки регионов
  const fetchRegions = async () => {
    try {
      const data = await api.get('/plots/regions')
      setRegions(data)
    } catch (error) {
      console.error('Error fetching regions:', error)
    }
  }

  // Добавляем функцию для загрузки локаций
  const fetchLocations = async () => {
    try {
      const data = await api.get('/plots/locations')
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
    }
  }

  // Добавим функцию для загрузки категорий
  const fetchCategories = async () => {
    try {
      const data = await api.get('/plots/categories')
      setCategories(data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchRegions()
    fetchLocations()
    fetchCategories() // Добавляем вызов
  }, [])

  const fetchPlots = async () => {
    try {
      setLoading(true)
      
      // Формируем параметры запроса
      const params = new URLSearchParams()
      params.append('skip', ((page - 1) * ITEMS_PER_PAGE).toString())
      params.append('limit', ITEMS_PER_PAGE.toString())
      
      if (filters.search) params.append('search', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.region) params.append('region', filters.region)
      if (filters.location) params.append('location', filters.location)
      if (filters.priceMin) params.append('price_min', filters.priceMin)
      if (filters.priceMax) params.append('price_max', filters.priceMax)
      if (filters.areaMin) params.append('area_min', filters.areaMin)
      if (filters.areaMax) params.append('area_max', filters.areaMax)
      
      // Добавляем фильтры по особенностям местности
      const terrain: any = {}
      if (filters.isNearRiver) terrain.isNearRiver = true
      if (filters.isNearMountains) terrain.isNearMountains = true
      if (filters.isNearForest) terrain.isNearForest = true
      if (filters.isNearLake) terrain.isNearLake = true
      if (filters.hasViewOnMountains) terrain.hasViewOnMountains = true
      if (Object.keys(terrain).length > 0) {
        params.append('terrain', JSON.stringify(terrain))
      }

      // Используем api утилиту вместо fetch
      const [plotsData, countData] = await Promise.all([
        api.get(`/plots?${params}`),
        api.get(`/plots/count?${params}`)
      ])
      
      // Форматируем данные
      const formattedPlots = plotsData.map((plot: any) => ({
        ...plot,
        id: String(plot.id),
        features: Array.isArray(plot.features) ? plot.features : JSON.parse(plot.features || '[]'),
        communications: Array.isArray(plot.communications) ? plot.communications : JSON.parse(plot.communications || '[]'),
        terrain: typeof plot.terrain === 'object' ? plot.terrain : JSON.parse(plot.terrain || '{}'),
        price: Number(plot.price),
        price_per_meter: Number(plot.price_per_meter), // Изменили с price_per_sotka
        area: Number(plot.area),
        specified_area: Number(plot.specified_area),
        imageUrl: plot.images?.[0]?.path ? `${process.env.NEXT_PUBLIC_API_URL}${plot.images[0].path}` : '/images/plot-placeholder.jpg',
        images: (plot.images || []).map((img: any) => ({
          ...img,
          path: `${process.env.NEXT_PUBLIC_API_URL}${img.path}`
        }))
      }))
      
      setPlots(formattedPlots)
      setTotalPages(Math.ceil(countData.total / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Error fetching plots:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlots()
  }, [page, filters, sortOption])

  const handleFilterChange = (name: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPage(1) // Сбрасываем страницу при изменении фильтров
    
    // Обновляем URL
    const newParams = new URLSearchParams(searchParams.toString())
    if (value) {
      newParams.set(name, value.toString())
    } else {
      newParams.delete(name)
    }
    newParams.set('page', '1')
    router.push(`/catalog?${newParams.toString()}`)
  }

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS)
    setPage(1)
    router.push('/catalog')
  }

  const sortPlots = (plots: LandPlot[], sortOption: SortOption) => {
    return [...plots].sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'area-asc':
          return a.area - b.area
        case 'area-desc':
          return b.area - a.area
        default:
          return 0
      }
    })
  }

  const handleQuickView = (plot: LandPlot) => {
    setSelectedPlot(plot)
  }

  const SORT_OPTIONS = {
    'price-asc': 'Цена (по возрастанию)',
    'price-desc': 'Цена (по убыванию)',
    'area-asc': 'Площадь, м² (по возрастанию)',
    'area-desc': 'Площадь, м² (по убыванию)'
  }

  // Словарь местоположений
  const LOCATION_NAMES: Record<string, string> = {
    // Регионы
    'altai-republic': 'Республика Алтай',
    'altai-krai': 'Алтайский край',
    
    // Населенные пункты
    'gorno-altaysk': 'г. Горно-Алтайск',
    'maima': 'с. Майма',
    'chemal': 'с. Чемал',
    'altayskoe': 'с. Алтайское',
    'belokurikha': 'г. Белокуриха',
    'biysk': 'г. Бийск',
    'choya': 'с. Чоя',
    'ongudai': 'с. Онгудай',
    'ust-koksa': 'с. Усть-Кокса',
    'ust-kan': 'с. Усть-Кан',
    'shebalino': 'с. Шебалино',
    'turochak': 'с. Турочак',
    'ulagan': 'с. Улаган',
    'kosh-agach': 'с. Кош-Агач',
    'other': 'Другие населенные пункты'
  }

  const getFilterLabel = (key: string, value: string | boolean | number | undefined) => {
    switch (key) {
      case 'land_category':
        return value as string
      case 'status':
        return value === 'available' ? 'Доступен' : 
               value === 'reserved' ? 'Забронирован' : 
               'Продан'
      case 'region':
        return LOCATION_NAMES[value as string] || value as string
      case 'location':
        return LOCATION_NAMES[value as string] || value as string
      case 'isNearRiver':
        return 'У реки'
      case 'isNearMountains':
        return 'У гор'
      case 'isNearForest':
        return 'У леса'
      case 'isNearLake':
        return 'У озера'
      case 'hasViewOnMountains':
        return 'Вид на горы'
      default:
        return value?.toString() || ''
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16 md:pt-20">
        {/* Hero секция */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 lg:py-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Каталог земельных участков</h1>
            <p className="text-base sm:text-lg text-gray-600">Найдено {plots.length} вариантов для покупки</p>
          </div>
        </div>

        {/* Основной контент */}
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8" style={{maxWidth: '1400px'}}>
          {/* Панель управления */}
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              {/* Фильтры и сортировка */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
                >
                  <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 text-primary/70" />
                  <span>Фильтры</span>
                  {Object.keys(filters).some(key => filters[key as keyof Filters]) && (
                    <span className="bg-primary text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
                      Активны
                    </span>
                  )}
                </button>

                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as SortOption)}
                  className="form-select py-2 text-sm sm:text-base bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Вид отображения */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 self-start sm:self-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow text-primary' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Плитка"
                >
                  <ViewColumnsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 sm:p-2 rounded-md transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white shadow text-primary' 
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                  title="Список"
                >
                  <ListBulletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Активные фильтры */}
            {Object.keys(filters).some(key => filters[key as keyof Filters]) && (
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (!value) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => handleFilterChange(key as keyof Filters, '')}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs sm:text-sm transition-colors"
                    >
                      <span>{getFilterLabel(key, value)}</span>
                      <XMarkIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  );
                })}
                <button
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-primary hover:text-primary-dark transition-colors font-medium"
                >
                  Сбросить все
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Боковая панель с фильтрами */}
            <div className={`lg:w-72 xl:w-80 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 filters-sticky border border-gray-100">
                {/* Поиск */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Поиск
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Поиск по названию или кадастровому номеру..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="form-input w-full text-sm sm:text-base rounded-lg pl-10 pr-4 py-2 border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-500">
                    Введите название участка или кадастровый номер
                  </p>
                </div>

                {/* Категория земель */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория земель
                  </label>
                  <select
                    value={filters.land_category}
                    onChange={(e) => handleFilterChange('land_category', e.target.value)}
                    className="form-select w-full text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors cursor-pointer"
                  >
                    <option value="">Все категории</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Статус */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleFilterChange('status', filters.status === 'available' ? '' : 'available')}
                      className={`py-2 px-2 text-xs sm:text-sm rounded-lg text-center transition-colors ${
                        filters.status === 'available' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Доступен
                    </button>
                    <button
                      onClick={() => handleFilterChange('status', filters.status === 'reserved' ? '' : 'reserved')}
                      className={`py-2 px-2 text-xs sm:text-sm rounded-lg text-center transition-colors ${
                        filters.status === 'reserved' 
                          ? 'bg-yellow-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Бронь
                    </button>
                    <button
                      onClick={() => handleFilterChange('status', filters.status === 'sold' ? '' : 'sold')}
                      className={`py-2 px-2 text-xs sm:text-sm rounded-lg text-center transition-colors ${
                        filters.status === 'sold' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      Продан
                    </button>
                  </div>
                </div>

                {/* Регион */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Регион
                  </label>
                  <select
                    value={filters.region}
                    onChange={(e) => handleFilterChange('region', e.target.value)}
                    className="form-select w-full text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors cursor-pointer"
                  >
                    <option value="">Все регионы</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {LOCATION_NAMES[region] || region}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Локация */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Населенный пункт
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="form-select w-full text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors cursor-pointer"
                  >
                    <option value="">Все населенные пункты</option>
                    {locations.map((location) => (
                      <option key={location} value={location}>
                        {LOCATION_NAMES[location] || location}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Цена */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Цена, ₽
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="form-input w-1/2 text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="form-input w-1/2 text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Площадь */}
                <div className="mb-5 sm:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Площадь, м²
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.areaMin}
                      onChange={(e) => handleFilterChange('areaMin', e.target.value)}
                      className="form-input w-1/2 text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
                    />
                    <span className="text-gray-500">—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.areaMax}
                      onChange={(e) => handleFilterChange('areaMax', e.target.value)}
                      className="form-input w-1/2 text-sm sm:text-base rounded-lg border-gray-300 focus:border-primary focus:ring focus:ring-primary/20 transition-colors"
                    />
                  </div>
                </div>

                {/* Особенности местности */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Особенности местности
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNearRiver"
                        checked={filters.isNearRiver}
                        onChange={(e) => handleFilterChange('isNearRiver', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isNearRiver" className="ml-2 block text-sm text-gray-700">
                        У реки
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNearLake"
                        checked={filters.isNearLake}
                        onChange={(e) => handleFilterChange('isNearLake', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isNearLake" className="ml-2 block text-sm text-gray-700">
                        У озера
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNearForest"
                        checked={filters.isNearForest}
                        onChange={(e) => handleFilterChange('isNearForest', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isNearForest" className="ml-2 block text-sm text-gray-700">
                        У леса
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isNearMountains"
                        checked={filters.isNearMountains}
                        onChange={(e) => handleFilterChange('isNearMountains', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="isNearMountains" className="ml-2 block text-sm text-gray-700">
                        У гор
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hasViewOnMountains"
                        checked={filters.hasViewOnMountains}
                        onChange={(e) => handleFilterChange('hasViewOnMountains', e.target.checked)}
                        className="form-checkbox h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label htmlFor="hasViewOnMountains" className="ml-2 block text-sm text-gray-700">
                        Вид на горы
                      </label>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center justify-center text-sm font-medium text-primary hover:text-primary-dark transition-colors gap-1"
                  >
                    <XMarkIcon className="w-4 h-4" />
                    Сбросить все фильтры
                  </button>
                </div>
              </div>
            </div>

            {/* Список участков */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {Array(6).fill(null).map((_, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : plots.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center border border-gray-100">
                  <div className="max-w-md mx-auto">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                      Участки не найдены
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      К сожалению, по вашему запросу ничего не найдено. Попробуйте изменить параметры поиска или сбросить фильтры.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-primary text-sm sm:text-base px-4 py-2 rounded-lg transition-colors"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>
              ) : (
                <div className={`grid gap-4 sm:gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {sortPlots(plots, sortOption).map((plot) => (
                    <LandPlotCard
                      key={plot.id}
                      plot={plot}
                      viewMode={viewMode}
                      onQuickView={() => handleQuickView(plot)}
                    />
                  ))}
                </div>
              )}

              {/* Пагинация */}
              {totalPages > 1 && (
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="inline-flex items-center gap-1 sm:gap-2 bg-white rounded-lg shadow-sm p-1 border border-gray-100">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-1.5 sm:p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Показываем максимум 5 страниц
                      let pageToShow;
                      if (totalPages <= 5) {
                        pageToShow = i + 1;
                      } else {
                        if (page <= 3) {
                          pageToShow = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageToShow = totalPages - 4 + i;
                        } else {
                          pageToShow = page - 2 + i;
                        }
                      }
                      return (
                        <button
                          key={pageToShow}
                          onClick={() => setPage(pageToShow)}
                          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md text-sm sm:text-base font-medium transition-all ${
                            pageToShow === page
                              ? 'bg-primary text-white shadow-sm'
                              : 'hover:bg-gray-100 transition-colors'
                          }`}
                        >
                          {pageToShow}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-1.5 sm:p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                    >
                      <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Модальное окно быстрого просмотра */}
      <PlotModal
        plot={selectedPlot}
        isOpen={!!selectedPlot}
        onClose={() => setSelectedPlot(null)}
      />
    </>
  )
} 