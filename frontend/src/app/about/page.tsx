'use client'

import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ScrollAnimation from '@/components/ScrollAnimation'
import { ClockIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

export default function ContactsPage() {
  return (
    <>
      <Head>
        <title>Контакты</title>
      </Head>
      
      <Header />
      <main className="min-h-screen pt-16 md:pt-20">
        <section className="min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/5 to-white">
          <ScrollAnimation>
            <div className="max-w-2xl mx-auto text-center px-4">
              <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
                <CodeBracketIcon className="w-12 h-12 text-primary animate-pulse" />
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                Страница в разработке
              </h1>
              
              <p className="text-xl text-gray-600 mb-8">
                Мы активно работаем над улучшением этого раздела. Приносим извинения за временные неудобства!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-gray-600">
                <div className="flex items-center gap-2">
                  <ClockIcon className="w-5 h-5 text-primary" />
                  <span>Ожидайте обновления в ближайшее время</span>
                </div>
              </div>
            </div>
          </ScrollAnimation>
        </section>
      </main>
      <Footer />
    </>
  )
}