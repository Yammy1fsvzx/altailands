'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { PlotStatus } from '@/types/land-plot'
import { PhotoIcon, XMarkIcon, ExclamationTriangleIcon, ArrowsUpDownIcon, StarIcon as StarIconOutline, DocumentIcon, PlusIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { API_URL } from '@/config/api'

const DRAFT_KEY = 'plot_draft'
const DRAFT_IMAGES_KEY = 'plot_draft_images'

interface ImageFile extends File {
  id: string;
  preview: string;
  isMain?: boolean;
}

export default function NewPlotPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingLocations, setExistingLocations] = useState<{ region: string; location: string }[]>([])
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [hasDraft, setHasDraft] = useState(false)

  // Начальное состояние формы
  const initialFormState = {
    title: '',
    description: {
      text: '',
      attachments: [] as { id: string; name: string; url: string; type: string }[]
    },
    cadastral_numbers: [''],
    area: '',
    specified_area: '',
    price: '',
    price_per_meter: '',
    location: '',
    region: '',
    land_category: '',
    permitted_use: '',
    features: [''],
    communications: [''],
    status: 'available' as PlotStatus,
    is_visible: true,
    terrain: {
      isNearRiver: false,
      isNearMountains: false,
      isNearForest: false,
      isNearLake: false,
      hasViewOnMountains: false,
      landscape: ''
    }
  }

  const [formData, setFormData] = useState(initialFormState)

  // Загрузка черновика при монтировании компонента
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    const savedImages = localStorage.getItem(DRAFT_IMAGES_KEY)
    
    if (savedDraft) {
      setHasDraft(true)
      setFormData(JSON.parse(savedDraft))
    }
    
    if (savedImages) {
      const images = JSON.parse(savedImages)
      setSelectedFiles(images)
    }
  }, [])

  // Сохранение черновика при изменении формы
  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(initialFormState)) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
      setHasDraft(true)
    }
  }, [formData])

  // Сохранение изображений при их изменении
  useEffect(() => {
    if (selectedFiles.length > 0) {
      const imagesForStorage = selectedFiles.map(file => ({
        id: file.id,
        preview: file.preview,
        isMain: file.isMain
      }))
      localStorage.setItem(DRAFT_IMAGES_KEY, JSON.stringify(imagesForStorage))
      setHasDraft(true)
    } else {
      localStorage.removeItem(DRAFT_IMAGES_KEY)
    }
  }, [selectedFiles])

  // Очистка черновика
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY)
    localStorage.removeItem(DRAFT_IMAGES_KEY)
    setFormData(initialFormState)
    setSelectedFiles([])
    setHasDraft(false)
  }

  // Получаем существующие участки для автозаполнения
  useEffect(() => {
    const fetchExistingPlots = async () => {
      try {
        const response = await fetch(`${API_URL}/plots/`)
        if (!response.ok) throw new Error('Ошибка загрузки данных')
        const plots = await response.json()
        
        // Создаем уникальный список локаций
        const locations = plots.reduce((acc: { region: string; location: string }[], plot: any) => {
          const exists = acc.some(
            item => item.region === plot.region && item.location === plot.location
          )
          if (!exists) {
            acc.push({ region: plot.region, location: plot.location })
          }
          return acc
        }, [])
        
        setExistingLocations(locations)
      } catch (err) {
        console.error('Ошибка при загрузке существующих участков:', err)
      }
    }
    
    fetchExistingPlots()
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).map(file => {
        const blob = file.slice(0, file.size, file.type)
        const newFile = new File([blob], file.name, { type: file.type }) as ImageFile
        newFile.id = Math.random().toString(36).substring(7)
        newFile.preview = URL.createObjectURL(newFile)
        newFile.isMain = selectedFiles.length === 0 // Первое изображение становится главным
        return newFile
      })
      
      setSelectedFiles(prev => [...prev, ...filesArray])
    }
  }

  const removeFile = (id: string) => {
    setSelectedFiles(prev => {
      const newFiles = prev.filter(file => file.id !== id)
      // Если удалили главное изображение, делаем первое в списке главным
      if (prev.find(f => f.id === id)?.isMain && newFiles.length > 0) {
        newFiles[0].isMain = true
      }
      return newFiles
    })
  }

  const setMainImage = (id: string) => {
    setSelectedFiles(prev => prev.map(file => ({
      ...file,
      isMain: file.id === id
    })))
  }

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setSelectedFiles(prev => {
      const index = prev.findIndex(file => file.id === id)
      if (
        (direction === 'up' && index === 0) || 
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev
      }

      const newFiles = [...prev]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      
      // Анимированный эффект для мобильных устройств
      if (window.innerWidth < 768) {
        const moveEffect = () => {
          try {
            // Получаем элементы изображений
            const imageElements = document.querySelectorAll('.image-preview-container');
            
            if (imageElements && imageElements.length > index && imageElements.length > newIndex) {
              // Добавляем классы анимации
              imageElements[index].classList.add('move-animation');
              imageElements[newIndex].classList.add('move-animation');
              
              // Удаляем классы анимации после завершения
              setTimeout(() => {
                imageElements.forEach(el => {
                  el.classList.remove('move-animation');
                });
              }, 300);
            }
          } catch (e) {
            console.log('Анимация недоступна:', e);
          }
        }
        
        // Вызываем эффект плавного перемещения
        requestAnimationFrame(moveEffect);
      }
      
      // Меняем местами элементы
      const temp = newFiles[index]
      newFiles[index] = newFiles[newIndex]
      newFiles[newIndex] = temp
      
      return newFiles
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Преобразуем числовые поля и удаляем ненужные поля
      const numericData = {
        title: formData.title,
        description: formData.description,
        cadastral_numbers: formData.cadastral_numbers.filter(n => n.trim()),
        area: parseFloat(formData.area),
        specified_area: parseFloat(formData.specified_area) || null,
        price: parseInt(formData.price),
        price_per_meter: parseInt(formData.price_per_meter),
        price_per_sotka: parseInt(formData.price_per_meter), // Добавляем price_per_sotka для совместимости
        location: formData.location,
        region: formData.region,
        land_category: formData.land_category,
        permitted_use: formData.permitted_use,
        features: formData.features.filter(f => f.trim()),
        communications: formData.communications.filter(c => c.trim()),
        status: formData.status,
        is_visible: formData.is_visible
      }

      console.log('Отправляемые данные:', JSON.stringify(numericData))

      // Создаем участок
      const response = await fetch(`${API_URL}/plots/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(numericData),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Ошибка при создании участка'
        
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.detail || errorMessage
        } catch (e) {
          errorMessage = errorText || errorMessage
        }
        
        console.error('Ошибка при создании участка:', errorMessage)
        throw new Error(errorMessage)
      }

      const newPlot = await response.json()

      // Загружаем изображения
      if (selectedFiles.length > 0) {
        const totalFiles = selectedFiles.length
        let uploadedFiles = 0

        try {
          // Сначала загружаем главное изображение
          const mainImage = selectedFiles.find(f => f.isMain)
          if (mainImage) {
            console.log('Отправка главного изображения:', {
              name: mainImage.name,
              size: mainImage.size,
              type: mainImage.type
            })

            const formData = new FormData()
            formData.append('file', mainImage)
            formData.append('is_main', 'true')
            formData.append('order', '0') // Добавляем порядок для главного изображения

            try {
              const uploadResponse = await fetch(`${API_URL}/plots/${newPlot.id}/images/`, {
                method: 'POST',
                body: formData,
              })

              let responseText = '';
              try {
                responseText = await uploadResponse.text();
                console.log('Ответ сервера:', responseText);
              } catch (e) {
                console.error('Ошибка при чтении ответа:', e);
              }

              if (!uploadResponse.ok) {
                let errorDetail = 'Неизвестная ошибка';
                try {
                  const errorData = JSON.parse(responseText);
                  errorDetail = errorData.detail || 'Неизвестная ошибка';
                } catch (e) {
                  errorDetail = responseText || 'Неизвестная ошибка';
                }
                console.error('Ошибка при загрузке главного изображения:', errorDetail);
                throw new Error(errorDetail);
              }

              // Обработка успешного ответа
              try {
                const result = JSON.parse(responseText);
                console.log('Успешно загружено изображение:', result);
              } catch (e) {
                console.error('Ошибка при разборе ответа:', e);
              }

              uploadedFiles++
              setUploadProgress((uploadedFiles / totalFiles) * 100)
            } catch (error) {
              console.error('Ошибка при загрузке главного изображения:', error);
              throw error;
            }
          }

          // Затем загружаем остальные изображения
          for (const file of selectedFiles) {
            if (!file.isMain) {
              const formData = new FormData()
              formData.append('file', file)
              formData.append('is_main', 'false')
              // Добавляем порядок для изображения
              const order = selectedFiles.findIndex(f => f.id === file.id);
              formData.append('order', String(order))

              console.log('Отправка дополнительного изображения:', {
                name: file.name,
                size: file.size,
                type: file.type,
                order: order
              })

              try {
                const uploadResponse = await fetch(`${API_URL}/plots/${newPlot.id}/images/`, {
                  method: 'POST',
                  body: formData,
                })

                let responseText = '';
                try {
                  responseText = await uploadResponse.text();
                  console.log('Ответ сервера:', responseText);
                } catch (e) {
                  console.error('Ошибка при чтении ответа:', e);
                }

                if (!uploadResponse.ok) {
                  let errorDetail = 'Неизвестная ошибка';
                  try {
                    const errorData = JSON.parse(responseText);
                    errorDetail = errorData.detail || 'Неизвестная ошибка';
                  } catch (e) {
                    errorDetail = responseText || 'Неизвестная ошибка';
                  }
                  console.error('Ошибка при загрузке дополнительного изображения:', errorDetail);
                  throw new Error(errorDetail);
                }

                // Обработка успешного ответа
                try {
                  const result = JSON.parse(responseText);
                  console.log('Успешно загружено изображение:', result);
                } catch (e) {
                  console.error('Ошибка при разборе ответа:', e);
                }

                uploadedFiles++
                setUploadProgress((uploadedFiles / totalFiles) * 100)
              } catch (error) {
                console.error('Ошибка при загрузке дополнительного изображения:', error);
                throw error;
              }
            }
          }
        } catch (err) {
          // В случае ошибки при загрузке изображений, удаляем созданный участок
          console.error('Полная информация об ошибке:', err)
          
          try {
            await fetch(`${API_URL}/plots/${newPlot.id}`, {
              method: 'DELETE',
            })
            console.log(`Участок ${newPlot.id} удален из-за ошибки при загрузке изображений`)
          } catch (deleteErr) {
            console.error('Ошибка при удалении участка:', deleteErr)
          }
          
          let errorMessage = 'Неизвестная ошибка при загрузке изображений';
          
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (typeof err === 'object' && err !== null) {
            errorMessage = JSON.stringify(err);
          }
          
          setError(`Ошибка при загрузке изображений: ${errorMessage}`);
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }
      }

      // После успешной публикации очищаем черновик
      clearDraft()
      router.push('/admin')
    } catch (err) {
      console.error('Ошибка при создании участка:', err)
      let errorMessage = 'Произошла ошибка';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        try {
          errorMessage = JSON.stringify(err);
        } catch (e) {
          errorMessage = 'Неизвестная ошибка';
        }
      }
      
      setError(errorMessage)
      // Прокручиваем страницу к сообщению об ошибке
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const handleArrayFieldChange = (
    field: 'features' | 'communications',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item))
    }))
  }

  const addArrayField = (field: 'features' | 'communications') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayField = (field: 'features' | 'communications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  useEffect(() => {
    // Добавляем стили для анимаций перемещения
    const style = document.createElement('style');
    style.textContent = `
      .move-animation {
        transition: transform 0.3s ease;
      }
      .image-preview-container {
        transition: opacity 0.2s, transform 0.3s ease;
      }
      @media (max-width: 768px) {
        .image-preview-container:active {
          opacity: 0.8;
          transform: scale(0.98);
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <AdminLayout title="Добавление нового участка">
      <div className="bg-white rounded-lg shadow">
        {/* Предупреждение о черновике */}
        {hasDraft && (
          <div className="p-3 sm:p-4 bg-yellow-50 border-b border-yellow-100">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <span className="text-sm text-yellow-700">
                У вас есть несохраненный черновик участка.
              </span>
              <button
                onClick={clearDraft}
                className="ml-auto text-sm font-medium text-yellow-700 hover:text-yellow-600 whitespace-nowrap"
              >
                Очистить черновик
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 p-4 sm:p-6">
          {/* 1. Изображения участка */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Изображения участка</h3>
            
            {/* Все изображения */}
            {selectedFiles.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-700">
                    {selectedFiles.length} {selectedFiles.length === 1 ? 'изображение' : selectedFiles.length > 1 && selectedFiles.length < 5 ? 'изображения' : 'изображений'}
                  </div>
                  {selectedFiles.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const mainImage = selectedFiles.find(file => file.isMain);
                        if (mainImage) {
                          const mainImageIndex = selectedFiles.findIndex(file => file.id === mainImage.id);
                          const newSelectedFiles = [...selectedFiles];
                          // Перемещаем главное изображение в начало списка
                          newSelectedFiles.splice(mainImageIndex, 1);
                          newSelectedFiles.unshift(mainImage);
                          setSelectedFiles(newSelectedFiles);
                        }
                      }}
                      className="text-xs text-green-600 hover:text-green-800 p-1"
                    >
                      Переместить главное изображение вначало
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 mb-4 pt-1">
                  {selectedFiles.map((file, index) => (
                    <div key={file.id} className="relative group image-preview-container">
                      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                        <img
                          src={file.preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        {/* Верхняя панель управления - звездочка и удаление */}
                        <div className="absolute top-2 right-2 flex gap-1.5 sm:gap-2 z-10">
                          <button
                            type="button"
                            onClick={() => setMainImage(file.id)}
                            className="p-1 sm:p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
                            title={file.isMain ? "Главное изображение" : "Сделать главным"}
                          >
                            {file.isMain ? (
                              <StarIconSolid className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                            ) : (
                              <StarIconOutline className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id)}
                            className="p-1 sm:p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
                            title="Удалить изображение"
                          >
                            <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Бирка с номером */}
                      <div className="absolute -top-2 -right-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md z-20 shadow-sm border border-gray-200">
                        {index + 1}
                      </div>
                      
                      {/* Бирка "Главное" */}
                      {file.isMain && (
                        <div className="absolute -top-2 -left-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md z-20 shadow-sm border border-yellow-200">
                          Главное
                        </div>
                      )}
                      
                      {/* Мобильные кнопки для перемещения изображений - по центру внизу */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(file.id, 'up')}
                            className="p-1.5 rounded-full bg-white shadow-sm border border-gray-200 active:bg-gray-50"
                            aria-label="Переместить вверх"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                        )}
                        {index < selectedFiles.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(file.id, 'down')}
                            className="p-1.5 rounded-full bg-white shadow-sm border border-gray-200 active:bg-gray-50"
                            aria-label="Переместить вниз"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Загрузка изображений */}
            <div className="mt-4">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-white">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer rounded-md bg-white font-medium text-green-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 hover:text-green-500">
                      <span>Загрузить изображения</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        className="sr-only"
                        onChange={handleFileSelect}
                      />
                    </label>
                    <span className="text-xs text-gray-500">PNG, JPG до 10MB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Описание и файлы */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Описание участка</h3>
            
            <div className="space-y-4">
              <div>
                <textarea
                  id="description"
                  rows={6}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                  value={formData.description.text}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    description: { ...prev.description, text: e.target.value }
                  }))}
                  placeholder="Подробное описание участка..."
                />
              </div>
              
              {/* Прикрепленные файлы */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Прикрепленные документы</span>
                  <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200">
                    Прикрепить файл
                    <input
                      type="file"
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const formData = new FormData();
                          formData.append('file', file);
                          formData.append('document_type', 'document');
                          
                          try {
                            const response = await fetch(`${API_URL}/admin/upload-document`, {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.detail || 'Ошибка загрузки файла');
                            }
                            
                            const result = await response.json();
                            setFormData(prev => ({
                              ...prev,
                              description: {
                                ...prev.description,
                                attachments: [
                                  ...prev.description.attachments,
                                  {
                                    id: result.id,
                                    name: result.name,
                                    url: result.url,
                                    type: 'document'
                                  }
                                ]
                              }
                            }));
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Ошибка загрузки файла');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                
                {/* Кнопка для загрузки нескольких файлов */}
                <div className="mt-2">
                  <label className="cursor-pointer inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200">
                    Загрузить несколько файлов
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const formData = new FormData();
                          
                          // Добавляем все файлы в formData
                          Array.from(e.target.files).forEach(file => {
                            formData.append('files', file);
                          });
                          
                          formData.append('document_type', 'document');
                          
                          try {
                            const response = await fetch(`${API_URL}/admin/upload-documents`, {
                              method: 'POST',
                              body: formData
                            });
                            
                            if (!response.ok) {
                              const error = await response.json();
                              throw new Error(error.detail || 'Ошибка загрузки файлов');
                            }
                            
                            const results = await response.json();
                            
                            // Добавляем все загруженные файлы в состояние
                            setFormData(prev => ({
                              ...prev,
                              description: {
                                ...prev.description,
                                attachments: [
                                  ...prev.description.attachments,
                                  ...results.map((result: any) => ({
                                    id: result.id,
                                    name: result.name,
                                    url: result.url,
                                    type: 'document'
                                  }))
                                ]
                              }
                            }));
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Ошибка загрузки файлов');
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                
                {/* Список загруженных файлов */}
                <div className="space-y-2 bg-white rounded-lg p-4">
                  {formData.description.attachments.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-4">
                      Нет прикрепленных файлов
                    </div>
                  ) : (
                    formData.description.attachments.map((file, index) => (
                      <div key={file.id} className="flex flex-wrap items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center min-w-0 mr-2 mb-2 sm:mb-0">
                          <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                          <span className="text-sm text-gray-900 truncate">{file.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              description: {
                                ...prev.description,
                                attachments: prev.description.attachments.filter((_, i) => i !== index)
                              }
                            }));
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Удалить файл"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Основная информация */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Основная информация</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="col-span-1 sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Название участка
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Кадастровые номера */}
              <div className="col-span-1 sm:col-span-2">
                <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Кадастровые номера
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      cadastral_numbers: [...prev.cadastral_numbers, '']
                    }))}
                    className="inline-flex items-center px-2.5 py-1.5 text-xs sm:text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                    Добавить номер
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.cadastral_numbers.map((number, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-grow">
                        <input
                          type="text"
                          value={number}
                          onChange={e => {
                            const newNumbers = [...formData.cadastral_numbers]
                            newNumbers[index] = e.target.value
                            setFormData(prev => ({ ...prev, cadastral_numbers: newNumbers }))
                          }}
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                          placeholder="Введите кадастровый номер"
                        />
                      </div>
                      {formData.cadastral_numbers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newNumbers = formData.cadastral_numbers.filter((_, i) => i !== index)
                            setFormData(prev => ({ ...prev, cadastral_numbers: newNumbers }))
                          }}
                          className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 sm:flex-shrink-0"
                        >
                          <XMarkIcon className="h-4 w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Удалить</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Населенный пункт
                </label>
                <input
                  type="text"
                  id="location"
                  list="locations"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
                <datalist id="locations">
                  {existingLocations.map((item, index) => (
                    <option key={index} value={item.location} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
                  Регион
                </label>
                <input
                  type="text"
                  id="region"
                  list="regions"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.region}
                  onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                />
                <datalist id="regions">
                  {existingLocations.map((item, index) => (
                    <option key={index} value={item.region} />
                  ))}
                </datalist>
              </div>

              <div>
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                  Площадь (м²)
                </label>
                <input
                  type="number"
                  id="area"
                  required
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.area}
                  onChange={e => setFormData(prev => ({ ...prev, area: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="specified_area" className="block text-sm font-medium text-gray-700 mb-1">
                  Уточненная площадь (м²)
                </label>
                <input
                  type="number"
                  id="specified_area"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.specified_area}
                  onChange={e => setFormData(prev => ({ ...prev, specified_area: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="land_category" className="block text-sm font-medium text-gray-700 mb-1">
                  Категория земель
                </label>
                <input
                  type="text"
                  id="land_category"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.land_category}
                  onChange={e => setFormData(prev => ({ ...prev, land_category: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="permitted_use" className="block text-sm font-medium text-gray-700 mb-1">
                  Виды разрешенного использования(ВРИ)
                </label>
                <input
                  type="text"
                  id="permitted_use"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.permitted_use}
                  onChange={e => setFormData(prev => ({ ...prev, permitted_use: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Статус участка
                </label>
                <select
                  id="status"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.status}
                  onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PlotStatus }))}
                >
                  <option value="available">Свободен</option>
                  <option value="reserved">Забронирован</option>
                  <option value="sold">Продан</option>
                </select>
              </div>

              <div className="flex items-center sm:justify-start py-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.is_visible}
                    onChange={e => setFormData(prev => ({ ...prev, is_visible: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-700">Участок виден на сайте</span>
                </label>
              </div>
            </div>
          </div>

          {/* Особенности участка */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Особенности участка</h3>
              <button
                type="button"
                onClick={() => addArrayField('features')}
                className="inline-flex items-center px-2.5 py-1.5 text-xs sm:text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Добавить особенность
              </button>
            </div>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={feature}
                      onChange={e => handleArrayFieldChange('features', index, e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
                      placeholder="Например: Панорамный вид"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayField('features', index)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 sm:flex-shrink-0"
                  >
                    <XMarkIcon className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Удалить</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Коммуникации */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Коммуникации</h3>
              <button
                type="button"
                onClick={() => addArrayField('communications')}
                className="inline-flex items-center px-2.5 py-1.5 text-xs sm:text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                <PlusIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Добавить коммуникацию
              </button>
            </div>
            <div className="space-y-3">
              {formData.communications.map((comm, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={comm}
                      onChange={e => handleArrayFieldChange('communications', index, e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
                      placeholder="Например: Электричество 15 кВт"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeArrayField('communications', index)}
                    className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 sm:flex-shrink-0"
                  >
                    <XMarkIcon className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Удалить</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Стоимость */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Стоимость участка</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Стоимость (₽)
                </label>
                <input
                  type="number"
                  id="price"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.price}
                  onChange={e => {
                    const price = e.target.value
                    const area = parseFloat(formData.area)
                    setFormData(prev => ({
                      ...prev,
                      price,
                      price_per_meter: area ? Math.round(parseInt(price) / area).toString() : '0'
                    }))
                  }}
                />
              </div>

              <div>
                <label htmlFor="price_per_meter" className="block text-sm font-medium text-gray-700 mb-1">
                  Цена за м² (₽)
                </label>
                <input
                  type="number"
                  id="price_per_meter"
                  required
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.price_per_meter}
                  onChange={e => setFormData(prev => ({ ...prev, price_per_meter: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2 sm:mb-0"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(DRAFT_KEY, JSON.stringify(formData))
                router.push('/admin')
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2 sm:mb-0"
            >
              Сохранить черновик
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Опубликовать'}
            </button>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Ошибка при создании участка
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </AdminLayout>
  )
} 