/**
 * Translation service for portfolio items
 * Supports DeepL, Microsoft Translator, Google Translate, LibreTranslate, and MyMemory APIs
 */

interface TranslationOptions {
  source: 'tr' | 'en' | 'fr'
  target: 'en' | 'fr'
  text: string
}

/**
 * Translate text using Google Translate API
 */
async function translateWithGoogle(text: string, targetLang: 'en' | 'fr'): Promise<string> {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY
  
  if (!apiKey) {
    console.warn('Google Translate API key not found. Returning original text.')
    return text
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'tr',
          target: targetLang,
          format: 'text',
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText || text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Translate text using Microsoft Translator API (Azure)
 * FREE: 2 million characters/month
 */
async function translateWithMicrosoft(text: string, targetLang: 'en' | 'fr'): Promise<string> {
  const apiKey = process.env.MICROSOFT_TRANSLATOR_API_KEY
  const region = process.env.MICROSOFT_TRANSLATOR_REGION || 'global'
  
  if (!apiKey) {
    console.warn('Microsoft Translator API key not found. Returning original text.')
    return text
  }

  try {
    // Get access token first
    const tokenResponse = await fetch(
      `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!tokenResponse.ok) {
      throw new Error(`Microsoft Translator token error: ${tokenResponse.statusText}`)
    }

    const accessToken = await tokenResponse.text()

    // Translate text
    const targetLangCode = targetLang === 'en' ? 'en' : 'fr'
    const translateResponse = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=tr&to=${targetLangCode}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([{ Text: text }]),
      }
    )

    if (!translateResponse.ok) {
      throw new Error(`Microsoft Translator API error: ${translateResponse.statusText}`)
    }

    const data = await translateResponse.json()
    return data[0]?.translations[0]?.text || text
  } catch (error) {
    console.error('Microsoft Translator error:', error)
    return text
  }
}

/**
 * Translate text using DeepL API
 */
async function translateWithDeepL(text: string, targetLang: 'en' | 'fr'): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  
  if (!apiKey) {
    console.warn('DeepL API key not found. Returning original text.')
    return text
  }

  try {
    const targetLangCode = targetLang === 'en' ? 'EN' : 'FR'
    const response = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        source_lang: 'TR',
        target_lang: targetLangCode,
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translations[0].text || text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Translate text (tries DeepL first, falls back to Google Translate)
 */
export async function translateText({ source, target, text }: TranslationOptions): Promise<string> {
  if (!text || text.trim() === '') {
    return ''
  }

  // If source and target are the same, return original
  if (source === target) {
    return text
  }

  // Try DeepL first (better quality)
  if (process.env.DEEPL_API_KEY) {
    try {
      return await translateWithDeepL(text, target)
    } catch (error) {
      console.warn('DeepL translation failed, trying Microsoft Translator:', error)
    }
  }

  // Try Microsoft Translator (2M chars/month free)
  if (process.env.MICROSOFT_TRANSLATOR_API_KEY) {
    try {
      return await translateWithMicrosoft(text, target)
    } catch (error) {
      console.warn('Microsoft Translator failed, trying Google Translate:', error)
    }
  }

  // Fallback to Google Translate
  if (process.env.GOOGLE_TRANSLATE_API_KEY) {
    try {
      return await translateWithGoogle(text, target)
    } catch (error) {
      console.error('Google Translate also failed:', error)
    }
  }

  // Try LibreTranslate (completely free, no API key needed)
  try {
    return await translateWithLibreTranslate(text, target)
  } catch (error) {
    console.warn('LibreTranslate failed, trying MyMemory:', error)
  }

  // Try MyMemory (free, no API key needed for basic usage)
  try {
    return await translateWithMyMemory(text, target)
  } catch (error) {
    console.warn('MyMemory also failed:', error)
  }

  // If all methods fail, return original text
  console.warn('All translation methods failed. Returning original text.')
  return text
}

/**
 * Translate text using LibreTranslate (FREE, no API key needed)
 * Open source translation service
 */
async function translateWithLibreTranslate(text: string, targetLang: 'en' | 'fr'): Promise<string> {
  try {
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: 'tr',
        target: targetLang,
        format: 'text',
      }),
    })

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.translatedText || text
  } catch (error) {
    console.error('LibreTranslate error:', error)
    throw error // Re-throw to allow fallback
  }
}

/**
 * Translate text using MyMemory Translation API (FREE, no API key needed)
 * 10,000 words/day free limit
 */
async function translateWithMyMemory(text: string, targetLang: 'en' | 'fr'): Promise<string> {
  try {
    const targetLangCode = targetLang === 'en' ? 'en' : 'fr'
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=tr|${targetLangCode}`
    )

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.statusText}`)
    }

    const data = await response.json()
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText
    }
    
    throw new Error('MyMemory translation failed')
  } catch (error) {
    console.error('MyMemory error:', error)
    throw error // Re-throw to allow fallback
  }
}

/**
 * Translate Turkish text to both English and French
 */
export async function translateFromTurkish(text: string): Promise<{ en: string; fr: string }> {
  const [en, fr] = await Promise.all([
    translateText({ source: 'tr', target: 'en', text }),
    translateText({ source: 'tr', target: 'fr', text }),
  ])

  return { en, fr }
}
