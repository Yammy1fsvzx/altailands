'use client'

import { useState, Fragment } from 'react'
import Image from 'next/image'
import { Dialog, Transition } from '@headlessui/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  XMarkIcon,
  ArrowsPointingOutIcon
} from '@heroicons/react/24/outline'

interface ImageGalleryProps {
  images: string[]
  title: string
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [swiper, setSwiper] = useState<any>(null)

  // Создаем HTML элемент изображения для предзагрузки
  const preloadImage = (src: string): HTMLImageElement => {
    const img = document.createElement('img')
    img.src = src
    return img
  }

  // Функция для переключения на выбранное изображение
  const goToSlide = (index: number) => {
    if (swiper) {
      swiper.slideTo(index)
    }
  }

  return (
    <div className="space-y-4">
      {/* Основная галерея */}
      <div className="relative h-[600px] rounded-xl overflow-hidden bg-gray-900">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ type: 'fraction' }}
          onSwiper={setSwiper}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          className="h-full group"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full flex items-center justify-center bg-black">
                <Image
                  src={image}
                  alt={`${title} - фото ${index + 1}`}
                  fill
                  className="object-contain"
                  quality={90}
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                  onLoadingComplete={(img) => {
                    // Предзагружаем следующее изображение
                    if (index < images.length - 1) {
                      preloadImage(images[index + 1])
                    }
                  }}
                />
              </div>
            </SwiperSlide>
          ))}

          {/* Кнопка полноэкранного режима */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-10 rounded-full bg-white/80 p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white"
          >
            <ArrowsPointingOutIcon className="w-6 h-6 text-gray-900" />
          </button>
        </Swiper>
      </div>

      {/* Превью */}
      <div className="grid grid-cols-6 gap-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`
              relative aspect-video rounded-lg overflow-hidden transition-all
              ${index === currentIndex 
                ? 'ring-2 ring-primary ring-offset-2' 
                : 'opacity-70 hover:opacity-100 hover:ring-2 hover:ring-gray-300 hover:ring-offset-2'
              }
            `}
          >
            <Image
              src={image}
              alt={`${title} - превью ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 16vw"
            />
          </button>
        ))}
      </div>

      {/* Полноэкранный режим */}
      <Transition show={isFullscreen} as={Fragment}>
        <Dialog 
          as="div" 
          className="fixed inset-0 z-50"
          onClose={() => setIsFullscreen(false)}
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
            <div className="fixed inset-0 bg-black" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <Swiper
              modules={[Navigation, Pagination]}
              navigation
              pagination={{ type: 'fraction' }}
              initialSlide={currentIndex}
              onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
              className="h-full w-full"
            >
              {images.map((image, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image
                      src={image}
                      alt={`${title} - фото ${index + 1}`}
                      fill
                      className="object-contain"
                      quality={100}
                      sizes="100vw"
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
} 