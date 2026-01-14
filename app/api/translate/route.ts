import { NextRequest, NextResponse } from 'next/server'
import { translateFromTurkish } from '@/lib/translations/translator'

/**
 * API route for translating Turkish text to English and French
 * Used by the portfolio form for auto-translation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Check if premium API keys are configured (optional - free APIs will be used as fallback)
    const hasDeepL = !!process.env.DEEPL_API_KEY
    const hasMicrosoft = !!process.env.MICROSOFT_TRANSLATOR_API_KEY
    const hasGoogle = !!process.env.GOOGLE_TRANSLATE_API_KEY

    // Note: LibreTranslate and MyMemory are free and don't need API keys
    // They will be used automatically as fallback

    // Translate from Turkish to English and French
    const translations = await translateFromTurkish(text)

    // Check if translations are actually different from source
    if (translations.en === text && translations.fr === text) {
      console.warn('Translation returned same text - API keys may be invalid or API may have failed')
      return NextResponse.json(
        {
          ...translations,
          warning: 'Translation returned same text. API keys may be invalid.'
        },
        { status: 200 }
      )
    }

    return NextResponse.json(translations)
  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { 
        error: 'Translation failed', 
        en: '', 
        fr: '',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
