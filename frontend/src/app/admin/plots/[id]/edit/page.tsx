'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { PlotStatus, LandPlot } from '@/types/land-plot'
import { PhotoIcon, XMarkIcon, ExclamationTriangleIcon, ArrowsUpDownIcon, StarIcon as StarIconOutline, DocumentIcon, PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { use } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { api } from '@/utils/api'
import { API_URL } from '@/config/api'

interface ImageFile extends File {
  id: string;
  preview: string;
  isMain?: boolean;
}

interface ImageItem {
  id: number
  type: 'IMAGE'
  index: number
  is_main: boolean
}

interface CombinedImage {
  id: string | number;
  type: 'existing' | 'new';
  preview: string;
  filename: string;
  path?: string;
  is_main: boolean;
  order: number;
  file?: File;
}

interface DraggableImageProps {
  image: CombinedImage;
  index: number;
  moveImage: (dragIndex: number, hoverIndex: number) => void;
  setMainImage: (id: string | number, type: 'existing' | 'new') => void;
  removeImage: (id: string | number, type: 'existing' | 'new') => void;
  totalImages: number;
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

const DraggableImage = ({ 
  image, 
  index, 
  moveImage,
  setMainImage,
  removeImage,
  totalImages
}: DraggableImageProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'IMAGE',
    item: { id: image.id, type: 'IMAGE', index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'IMAGE',
    hover(item: ImageItem) {
      if (item.index === index) {
        return
      }
      moveImage(item.index, index)
      item.index = index
    },
  })

  const dragDropRef = useRef<HTMLDivElement>(null)
  drag(drop(dragDropRef))

  const imageSrc = image.type === 'existing' 
    ? `http://localhost:8000${image.path}` 
    : image.preview;

  return (
    <div
      ref={dragDropRef}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="relative group image-preview-container"
    >
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
        <img
          src={imageSrc}
          alt={image.filename}
          className="object-cover w-full h-full"
        />
        
        {/* Верхняя панель управления - звездочка и удаление */}
        <div className="absolute top-2 right-2 flex gap-2 z-10">
          <button
            type="button"
            onClick={() => setMainImage(image.id, image.type)}
            className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
            title={image.is_main ? "Главное изображение" : "Сделать главным"}
          >
            {image.is_main ? (
              <StarIconSolid className="w-5 h-5 text-yellow-500" />
            ) : (
              <StarIconOutline className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => removeImage(image.id, image.type)}
            className="p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition-colors hover:bg-white"
            title="Удалить изображение"
          >
            <XMarkIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Бирка с номером */}
      <div className="absolute -top-2 -right-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-md z-20 shadow-sm border border-gray-200">
        {index + 1}
      </div>
      
      {/* Бирка "Главное" */}
      {image.is_main && (
        <div className="absolute -top-2 -left-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-md z-20 shadow-sm border border-yellow-200">
          Главное
        </div>
      )}
      
      {/* Мобильные кнопки для перемещения изображений - внизу по центру */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {index > 0 && (
          <button
            type="button"
            onClick={() => moveImage(index, index - 1)}
            className="p-1.5 rounded-full bg-white shadow-sm border border-gray-200 active:bg-gray-50"
            aria-label="Переместить вверх"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        {index < (totalImages - 1) && (
          <button
            type="button"
            onClick={() => moveImage(index, index + 1)}
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
  )
}

// Функция для скачивания файла
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

export default function EditPlotPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [existingLocations, setExistingLocations] = useState<{ region: string; location: string }[]>([])
  const [selectedFiles, setSelectedFiles] = useState<ImageFile[]>([])
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [existingImages, setExistingImages] = useState<any[]>([])
  const [combinedImages, setCombinedImages] = useState<CombinedImage[]>([])
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

  // Начальное состояние формы
  const initialFormState = {
    title: '',
    description: {
      text: '',
      attachments: [] as { id: string; name: string; url: string; type: string }[]
    },
    cadastral_numbers: [''],
    area: 0,
    specified_area: 0,
    price: 0,
    price_per_meter: 0,
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

  // Загрузка данных участка
  useEffect(() => {
    const fetchPlotData = async () => {
      try {
        console.log(`Загрузка данных участка с ID: ${id}`);
        const response = await fetch(`${API_URL}/plots/${id}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Ошибка при загрузке данных участка: ${errorText}`);
          throw new Error(`Ошибка загрузки данных участка: ${response.status} ${response.statusText}`);
        }
        
        const plotData = await response.json();
        console.log('Данные участка получены:', plotData);
        
        setFormData({
          ...plotData,
          area: plotData.area.toString(),
          specified_area: plotData.specified_area?.toString() || '',
          price: plotData.price.toString(),
          price_per_sotka: plotData.price_per_sotka.toString(),
          description: {
            text: plotData.description?.text || '',
            attachments: plotData.description?.attachments || []
          },
          cadastral_numbers: plotData.cadastral_numbers || ['']
        });
        
        // Преобразуем существующие изображения в combinedImages
        if (plotData.images && Array.isArray(plotData.images)) {
          console.log(`Найдено ${plotData.images.length} изображений`);
          setCombinedImages(plotData.images.map((img: any, index: number) => ({
            id: img.id,
            type: 'existing',
            preview: `http://localhost:8000${img.path}`,
            filename: img.filename,
            path: img.path,
            is_main: img.is_main,
            order: index
          })));
        } else {
          console.warn('Изображения отсутствуют или имеют неверный формат:', plotData.images);
          setCombinedImages([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Ошибка при загрузке данных участка:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных участка');
        setLoading(false);
      }
    };

    fetchPlotData();
  }, [id]);

  // Получаем существующие участки для автозаполнения
  useEffect(() => {
    const fetchExistingPlots = async () => {
      try {
        const response = await fetch(`${API_URL}/plots/`)
        if (!response.ok) throw new Error('Ошибка загрузки данных')
        const plots = await response.json()
        
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
      const maxOrder = combinedImages.length > 0 
        ? Math.max(...combinedImages.map(img => img.order))
        : -1;
        
      const newFiles = Array.from(e.target.files).map((file, index) => {
        const blob = file.slice(0, file.size, file.type)
        const newFile = new File([blob], file.name, { type: file.type })
        return {
          id: Math.random().toString(36).substring(7),
          type: 'new' as const,
          preview: URL.createObjectURL(newFile),
          filename: file.name,
          is_main: combinedImages.length === 0 && index === 0, // Главное только если это первое изображение вообще
          order: maxOrder + 1 + index, // Увеличиваем порядок для каждого нового файла
          file: newFile
        }
      })
      
      setCombinedImages(prev => [...prev, ...newFiles])
    }
  }

  const removeImage = (id: string | number, type: 'existing' | 'new') => {
    setCombinedImages(prev => {
      const removedImage = prev.find(img => img.id === id);
      const newImages = prev.filter(img => img.id !== id);
      
      // Если удалили главное изображение и есть другие изображения
      if (removedImage?.is_main && newImages.length > 0) {
        // Делаем первое изображение главным
        newImages[0].is_main = true;
      }
      
      // Обновляем порядок оставшихся изображений
      return newImages.map((img, index) => ({ ...img, order: index }));
    });
  }

  const setMainImage = (id: string | number, type: 'existing' | 'new') => {
    setCombinedImages(prev => {
      const newImages = prev.map(img => ({
        ...img,
        is_main: img.id === id
      }))
      return newImages
    })
  }

  const handleFileAdd = (files: FileList) => {
    setPendingFiles(prev => [...prev, ...Array.from(files)]);
  };

  const handleFileRemove = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Проверка обязательных полей
      if (!formData.title) {
        throw new Error('Название участка обязательно');
      }
      if (!formData.description || !formData.description.text) {
        throw new Error('Описание участка обязательно');
      }
      if (!formData.cadastral_numbers || formData.cadastral_numbers.length === 0 || !formData.cadastral_numbers[0]) {
        throw new Error('Кадастровый номер обязателен');
      }
      if (!formData.area) {
        throw new Error('Площадь участка обязательна');
      }
      if (!formData.price) {
        throw new Error('Цена участка обязательна');
      }
      if (!formData.location) {
        throw new Error('Местоположение обязательно');
      }
      if (!formData.region) {
        throw new Error('Регион обязателен');
      }
      if (!formData.land_category) {
        throw new Error('Категория земель обязательна');
      }
      if (!formData.permitted_use) {
        throw new Error('Вид разрешенного использования обязателен');
      }

      // Обработка изображений
      // 1. Удаление существующих изображений, которых нет в combinedImages
      const existingImageIds = combinedImages
        .filter(img => img.type === 'existing')
        .map(img => img.id);
      
      // Получаем текущие изображения участка
      const plotResponse = await fetch(`${API_URL}/plots/${id}`);
      if (!plotResponse.ok) {
        throw new Error('Не удалось получить данные участка');
      }
      const plotData = await plotResponse.json();
      
      // Находим изображения, которые нужно удалить
      const imagesToDelete = plotData.images
        .filter((img: any) => !existingImageIds.includes(img.id));
      
      // Удаляем изображения
      for (const img of imagesToDelete) {
        try {
          console.log(`Удаление изображения ${img.id}`);
          const deleteResponse = await fetch(`${API_URL}/plots/${id}/images/${img.id}`, {
            method: 'DELETE'
          });
          if (!deleteResponse.ok) {
            const errorText = await deleteResponse.text();
            console.error(`Ошибка при удалении изображения ${img.id}: ${errorText}`);
          } else {
            console.log(`Изображение ${img.id} успешно удалено`);
          }
        } catch (error) {
          console.error(`Ошибка при удалении изображения ${img.id}:`, error);
        }
      }
      
      // 2. Загрузка новых изображений
      const newImages = combinedImages.filter(img => img.type === 'new');
      for (const img of newImages) {
        try {
          if (!img.file) {
            console.warn(`Пропуск изображения без файла: ${img.filename}`);
            continue;
          }
          
          const formData = new FormData();
          formData.append('file', img.file);
          formData.append('is_main', img.is_main.toString());
          formData.append('order', img.order.toString());
          
          console.log(`Загрузка изображения ${img.filename}`);
          const uploadResponse = await fetch(`http://localhost:8000/plots/${id}/images/`, {
            method: 'POST',
            body: formData
          });
          
          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`Ошибка при загрузке изображения ${img.filename}: ${errorText}`);
            try {
              const errorJson = JSON.parse(errorText);
              console.error('Детали ошибки:', errorJson);
            } catch (e) {
              // Если не удалось распарсить JSON, просто выводим текст ошибки
            }
          } else {
            console.log(`Изображение ${img.filename} успешно загружено`);
            const result = await uploadResponse.json();
            console.log('Результат загрузки:', result);
          }
        } catch (error) {
          console.error(`Ошибка при загрузке изображения ${img.filename}:`, error);
        }
      }
      
      // 3. Обновление порядка и главного изображения
      // Создаем массив для обновления порядка
      const imageOrder = combinedImages
        .filter(img => img.type === 'existing')
        .map((img, index) => ({
          id: Number(img.id), // Преобразуем id в число
          order: Number(index), // Убедимся, что order - число
          is_main: Boolean(img.is_main) // Убедимся, что is_main - булево значение
        }));
      
      // Отправляем запрос на обновление порядка
      if (imageOrder.length > 0) {
        try {
          console.log('Обновление порядка изображений:', imageOrder);
          
          // Проверяем данные перед отправкой
          const hasInvalidData = imageOrder.some(img => 
            typeof img.id !== 'number' || 
            typeof img.order !== 'number' || 
            typeof img.is_main !== 'boolean'
          );
          
          if (hasInvalidData) {
            console.error('Ошибка: некорректные данные для обновления порядка изображений', imageOrder);
            setError('Ошибка при обновлении порядка изображений: некорректные данные');
            return;
          }
          
          const requestBody = { images: imageOrder };
          console.log('Отправляемые данные:', JSON.stringify(requestBody));
          
          const reorderResponse = await fetch(`http://localhost:8000/plots/${id}/images/reorder`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
          });
          
          if (!reorderResponse.ok) {
            const errorText = await reorderResponse.text();
            console.error(`Ошибка при обновлении порядка изображений: ${errorText}`);
            try {
              const errorJson = JSON.parse(errorText);
              console.error('Детали ошибки:', errorJson);
              setError(`Ошибка при обновлении порядка изображений: ${errorJson.detail || errorText}`);
            } catch (e) {
              // Если не удалось распарсить JSON, просто выводим текст ошибки
              setError(`Ошибка при обновлении порядка изображений: ${errorText}`);
            }
          } else {
            console.log('Порядок изображений успешно обновлен');
            const result = await reorderResponse.json();
            console.log('Результат обновления порядка:', result);
          }
        } catch (error) {
          console.error('Ошибка при обновлении порядка изображений:', error);
          setError(`Ошибка при обновлении порядка изображений: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Сначала загружаем все файлы документов
      const uploadedFiles = await Promise.all(
        pendingFiles.map(file => api.uploadFile(file, 'document'))
      );

      // Добавляем загруженные файлы к существующим вложениям
      const updatedAttachments = [
        ...(formData.description?.attachments || []),
        ...uploadedFiles.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          type: file.type
        }))
      ];

      // Обновляем данные участка с новыми вложениями
      const updatedData = {
        ...formData,
        description: {
          text: formData.description?.text || '',
          attachments: updatedAttachments
        }
      };

      console.log('Обновление данных участка:', updatedData);
      try {
        const updateResponse = await api.patch(`/admin/plots/${id}`, updatedData, { isAdmin: true });
        console.log('Участок успешно обновлен:', updateResponse);
        router.push('/admin/plots');
      } catch (err) {
        console.error('Ошибка при обновлении участка:', err);
        setError(err instanceof Error ? err.message : 'Неизвестная ошибка при обновлении участка');
        // Прокручиваем страницу к сообщению об ошибке
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  };

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

  const moveImage = (dragIndex: number, hoverIndex: number) => {
    setCombinedImages(prev => {
      const newImages = [...prev]
      const draggedImage = newImages[dragIndex]
      newImages.splice(dragIndex, 1)
      newImages.splice(hoverIndex, 0, draggedImage)
      
      // Анимационный эффект для мобильных устройств
      if (window.innerWidth < 768) {
        const moveEffect = () => {
          try {
            // Получаем элементы изображений
            const imageElements = document.querySelectorAll('.image-preview-container');
            
            if (imageElements && imageElements.length > dragIndex && imageElements.length > hoverIndex) {
              // Добавляем классы анимации
              imageElements[dragIndex].classList.add('move-animation');
              imageElements[hoverIndex].classList.add('move-animation');
              
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
      
      // Обновляем порядок
      return newImages.map((img, index) => ({
        ...img,
        order: index
      }))
    })
  }

  // Добавляем эффект для стилей анимации
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

  if (loading) {
    return (
      <AdminLayout title="Редактирование участка">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Редактирование участка">
      <div className="bg-white rounded-lg shadow">
        <form onSubmit={handleSubmit} className="space-y-8 p-6">
          {/* 1. Изображения участка */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Изображения участка</h3>
            
            {/* Все изображения */}
            <DndProvider backend={HTML5Backend}>
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm text-gray-700">
                    {combinedImages.length} {combinedImages.length === 1 ? 'изображение' : combinedImages.length > 1 && combinedImages.length < 5 ? 'изображения' : 'изображений'}
                  </div>
                  {combinedImages.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => {
                        const mainImage = combinedImages.find(img => img.is_main);
                        if (mainImage) {
                          const mainImageIndex = combinedImages.findIndex(img => img.id === mainImage.id);
                          setCombinedImages(prev => {
                            const newImages = [...prev];
                            // Перемещаем главное изображение в начало списка
                            newImages.splice(mainImageIndex, 1);
                            newImages.unshift(mainImage);
                            
                            // Обновляем порядок
                            return newImages.map((img, index) => ({
                              ...img,
                              order: index
                            }));
                          });
                        }
                      }}
                      className="text-xs text-green-600 hover:text-green-800 p-1"
                    >
                      Переместить главное изображение вначало
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 mb-4 pt-1">
                  {combinedImages.map((image, index) => (
                    <DraggableImage
                      key={image.id}
                      image={image}
                      index={index}
                      moveImage={moveImage}
                      setMainImage={setMainImage}
                      removeImage={removeImage}
                      totalImages={combinedImages.length}
                    />
                  ))}
                </div>
              </>
            </DndProvider>

            {/* Загрузка новых изображений */}
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
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Описание участка</h3>
            
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
              <div className="mt-6">
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
                            const response = await fetch('http://localhost:8000/admin/upload-document', {
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
                            const response = await fetch('http://localhost:8000/admin/upload-documents', {
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
                      <div className="flex items-center min-w-0 flex-grow mr-2 mb-2 sm:mb-0">
                        <DocumentIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                        <span className="text-sm text-gray-900 truncate">{file.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => downloadFile(file.url, file.name)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Скачать файл"
                        >
                          <ArrowDownTrayIcon className="h-5 w-5" />
                        </button>
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
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* 3. Основная информация */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                <div className="flex justify-between items-center mb-2">
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
                          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm"
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
                  step="1"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.area}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      area: value,
                      price_per_meter: prev.price > 0 ? Math.round(prev.price / value) : 0
                    }))
                  }}
                />
              </div>

              <div>
                <label htmlFor="specified_area" className="block text-sm font-medium text-gray-700 mb-1">
                  Уточненная площадь (м²)
                </label>
                <input
                  type="number"
                  id="specified_area"
                  step="1"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.specified_area}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, specified_area: value }))
                  }}
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

              <div className="flex items-center justify-center sm:justify-start py-2">
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
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h3 className="text-lg font-medium text-gray-900">Особенности участка</h3>
              <button
                type="button"
                onClick={() => addArrayField('features')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
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
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
              <h3 className="text-lg font-medium text-gray-900">Коммуникации</h3>
              <button
                type="button"
                onClick={() => addArrayField('communications')}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
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
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Стоимость участка</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Стоимость (₽)
                </label>
                <input
                  type="number"
                  id="price"
                  required
                  step="1"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.price}
                  onChange={e => {
                    const price = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      price,
                      price_per_meter: prev.area > 0 ? Math.round(price / prev.area) : 0
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
                  step="1"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500 text-sm shadow-sm"
                  value={formData.price_per_meter}
                  onChange={e => {
                    const pricePerMeter = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      price_per_meter: pricePerMeter,
                      price: Math.round(pricePerMeter * prev.area)
                    }))
                  }}
                />
              </div>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                console.log('Текущие изображения:', combinedImages);
                alert('Информация об изображениях выведена в консоль');
              }}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2 sm:mb-0"
            >
              Отладка изображений
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 mb-2 sm:mb-0"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
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
                    Ошибка при обновлении участка
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