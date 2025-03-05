'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollAnimation from '@/components/ScrollAnimation'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-gray-50">
        {/* Заголовок */}
        <section className="bg-white border-b py-12">
          <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 md:py-20">
            <ScrollAnimation>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 text-center">
                Политика конфиденциальности
              </h1>
              <p className="text-gray-600 text-center max-w-2xl mx-auto">
                Мы серьезно относимся к защите ваших персональных данных. В этом документе описано, как мы собираем, используем и защищаем вашу информацию.
              </p>
            </ScrollAnimation>
          </div>
        </section>

        {/* Основной контент */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 md:p-10 space-y-8">
            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">1. Общие положения</h2>
                <p className="text-gray-600">
                  Настоящая политика конфиденциальности определяет порядок обработки и защиты информации о физических лицах, использующих сервисы сайта AltaiLand.
                </p>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">2. Собираемая информация</h2>
                <p className="text-gray-600">
                  Мы собираем следующие типы информации:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Имя и контактные данные</li>
                  <li>Электронная почта</li>
                  <li>Номер телефона</li>
                  <li>Информация о предпочтениях при выборе участка</li>
                  <li>Техническая информация о вашем устройстве и браузере</li>
                </ul>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">3. Цели сбора информации</h2>
                <p className="text-gray-600">
                  Мы используем собранную информацию для:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Предоставления вам информации об участках</li>
                  <li>Обработки ваших заявок и запросов</li>
                  <li>Улучшения качества наших услуг</li>
                  <li>Отправки важных уведомлений и обновлений</li>
                  <li>Предоставления персонализированных рекомендаций</li>
                </ul>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">4. Защита информации</h2>
                <p className="text-gray-600">
                  Мы принимаем все необходимые меры для защиты ваших персональных данных:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Используем шифрование при передаче данных</li>
                  <li>Ограничиваем доступ к персональным данным</li>
                  <li>Регулярно обновляем системы безопасности</li>
                  <li>Проводим аудит систем защиты данных</li>
                </ul>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">5. Права пользователей</h2>
                <p className="text-gray-600">
                  Вы имеете право:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>Получить информацию о хранящихся данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления ваших данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                </ul>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">6. Контакты</h2>
                <p className="text-gray-600">
                  По всем вопросам, связанным с обработкой персональных данных, вы можете обратиться к нам:
                </p>
                <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
                  <li>По электронной почте: privacy@altailand.ru</li>
                  <li>По телефону: +7 (XXX) XXX-XX-XX</li>
                  <li>Через форму обратной связи на сайте</li>
                </ul>
              </section>
            </ScrollAnimation>

            <ScrollAnimation>
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">7. Изменения политики конфиденциальности</h2>
                <p className="text-gray-600">
                  Мы оставляем за собой право вносить изменения в политику конфиденциальности. Все изменения будут опубликованы на этой странице с указанием даты последнего обновления.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  Последнее обновление: Февраль 2024
                </p>
              </section>
            </ScrollAnimation>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
} 