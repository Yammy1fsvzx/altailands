'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { API_URL } from '@/config/api'

interface QuizQuestion {
  id: number
  question: string
  options: string[]
  order: number
  is_active: boolean
}

export default function InlineQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [userContact, setUserContact] = useState({ 
    name: '', 
    phone: '', 
    email: '' 
  })
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState({
    phone: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(`${API_URL}/quiz/questions`)
        if (response.ok) {
          const data = await response.json()
          // Сортируем вопросы по порядку и фильтруем только активные
          const activeQuestions = data
            .filter((q: QuizQuestion) => q.is_active)
            .sort((a: QuizQuestion, b: QuizQuestion) => a.order - b.order)
          
          // Если нет активных вопросов, не показываем квиз
          if (activeQuestions.length === 0) {
            setShouldRender(false)
          } else {
            setQuestions(activeQuestions)
          }
        } else {
          setError('Не удалось загрузить вопросы')
        }
      } catch (error) {
        setError('Ошибка при загрузке вопросов')
        console.error('Error fetching questions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [questions[currentStep].id]: answer }))
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Показываем форму контактов
      setCurrentStep(questions.length)
    }
  }

  // Функция валидации телефона
  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/
    return phoneRegex.test(phone)
  }

  // Функция валидации email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmitContact = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Предотвращаем повторную отправку
    if (isSubmitting) return
    
    // Сброс ошибок
    setFormErrors({ phone: '', email: '' })
    
    // Валидация
    let hasErrors = false
    
    if (!validatePhone(userContact.phone)) {
      setFormErrors(prev => ({ 
        ...prev, 
        phone: 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX' 
      }))
      hasErrors = true
    }
    
    if (!validateEmail(userContact.email)) {
      setFormErrors(prev => ({ 
        ...prev, 
        email: 'Введите корректный email адрес' 
      }))
      hasErrors = true
    }
    
    if (hasErrors) return

    setIsSubmitting(true) // Устанавливаем флаг отправки

    try {
      const response = await fetch(`${API_URL}/quiz/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'quiz',
          name: userContact.name,
          phone: userContact.phone,
          email: userContact.email,
          answers: answers,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPromoCode(data.promo_code)
        setCurrentStep(questions.length + 1)
      } else {
        setError('Не удалось отправить ответы')
      }
    } catch (error) {
      setError('Ошибка при отправке ответов')
      console.error('Error submitting quiz:', error)
    } finally {
      setIsSubmitting(false) // Сбрасываем флаг отправки
    }
  }

  const resetQuiz = () => {
    setCurrentStep(0)
    setAnswers({})
    setUserContact({ name: '', phone: '', email: '' })
    setPromoCode(null)
    setError(null)
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Если нет вопросов или квиз не должен отображаться, возвращаем null
  if (!shouldRender || questions.length === 0) {
    return null
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="h-4 bg-gray-200 rounded w-full mb-6"></div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={resetQuiz}
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const questionCountText = questions.length === 1 ? 'вопрос' : questions.length < 5 ? 'вопроса' : 'вопросов';

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="section-title">Ответьте на {questions.length} {questionCountText} — получите актуальные предложения и промокод на скидку.</h2>
      <div className="decorative-line"></div>
      
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-12">
        {/* Прогресс-бар */}
        <div className="w-full h-2 bg-gray-100 rounded-full mb-8">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${((currentStep + 1) / (questions.length + 2)) * 100}%`
            }}
          ></div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep < questions.length ? (
              // Вопросы квиза
              <div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  {questions[currentStep].question}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questions[currentStep].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(option)}
                      className="p-4 text-left rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {currentStep > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={handlePrevStep}
                      className="text-gray-600 hover:text-primary transition-colors"
                    >
                      ← Назад
                    </button>
                  </div>
                )}
              </div>
            ) : currentStep === questions.length ? (
              // Форма контактов
              <form onSubmit={handleSubmitContact}>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Получите персональную скидку
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      required
                      value={userContact.name}
                      onChange={(e) => setUserContact(prev => ({ ...prev, name: e.target.value }))}
                      className="form-input"
                      placeholder="Иван"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Номер телефона
                    </label>
                    <input
                      type="tel"
                      required
                      value={userContact.phone}
                      onChange={(e) => setUserContact(prev => ({ ...prev, phone: e.target.value }))}
                      className={`form-input ${formErrors.phone ? 'border-red-500' : ''}`}
                      placeholder="+7 (XXX) XXX-XX-XX"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={userContact.email}
                      onChange={(e) => setUserContact(prev => ({ ...prev, email: e.target.value }))}
                      className={`form-input ${formErrors.email ? 'border-red-500' : ''}`}
                      placeholder="example@mail.ru"
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`btn-primary py-3 w-full ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Отправка...' : 'Получить промокод'}
                  </button>
                </div>
              </form>
            ) : (
              // Результат с промокодом
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">
                  Спасибо за доверие и выбор нашей компании
                </h3>
                <p className="text-gray-600 mb-6">
                  Вам на почту отправлен промокод на скидку 5% от суммы приобретаемого участка
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-xs mx-auto">
                  <p className="text-2xl font-bold text-primary">{promoCode}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 