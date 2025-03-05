export function formatPhoneNumber(phone: string): string {
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '')
  
  // Проверяем длину номера
  if (cleaned.length !== 11) {
    return phone // Возвращаем исходный номер, если он не соответствует формату
  }
  
  // Форматируем номер в виде +7 (XXX) XXX-XX-XX
  return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`
} 