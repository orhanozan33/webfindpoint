import { Locale, defaultLocale, locales } from './index'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'
import trMessages from '@/messages/tr.json'

const messagesMap: Record<Locale, typeof enMessages> = {
  en: enMessages,
  fr: frMessages,
  tr: trMessages,
}

export async function getMessages(locale: Locale) {
  try {
    // Fallback to default locale if locale is invalid
    const validLocale = (locales.includes(locale) ? locale : defaultLocale) as Locale
    const messages = messagesMap[validLocale]
    
    if (!messages) {
      console.error(`Messages not found for locale: ${locale}, falling back to ${defaultLocale}`)
      const fallbackMessages = messagesMap[defaultLocale]
      if (!fallbackMessages) {
        console.error('Default locale messages also not found!')
        // Return empty structure to prevent crashes
        return messagesMap.en || {} as typeof enMessages
      }
      return fallbackMessages
    }
    
    return messages
  } catch (error) {
    console.error('Error loading messages for locale:', locale, error)
    // Return default locale messages as fallback
    return messagesMap[defaultLocale] || messagesMap.en || {} as typeof enMessages
  }
}