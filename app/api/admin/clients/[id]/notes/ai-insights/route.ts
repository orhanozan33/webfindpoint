import { NextRequest, NextResponse } from 'next/server'
import { authorize } from '@/lib/auth/authorize'
import { initializeDatabase } from '@/lib/db/database'
import { ClientNote } from '@/entities/ClientNote'
import { summarizeClientHistory, generateFollowUpSuggestions, identifyRisks } from '@/lib/ai/provider'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authorize(request, { requiredPermission: 'canManageClients' })
  if (!auth.authorized) {
    return auth.response!
  }

  try {
    const { id } = await params
    const dataSource = await initializeDatabase()
    const notesRepository = dataSource.getRepository(ClientNote)
    const notes = await notesRepository.find({
      where: { clientId: id },
      order: { createdAt: 'DESC' },
    })

    if (notes.length === 0) {
      return NextResponse.json({
        summary: 'No notes available for this client.',
        suggestions: [],
        risks: [],
      })
    }

    const noteTexts = notes.map((note) => note.content)
    const context = noteTexts.join('\n\n')

    // Generate AI insights
    const [summary, suggestions, risks] = await Promise.all([
      summarizeClientHistory(noteTexts),
      generateFollowUpSuggestions(context),
      identifyRisks(noteTexts),
    ])

    return NextResponse.json({
      summary,
      suggestions,
      risks,
    })
  } catch (error) {
    console.error('Error generating AI insights:', error)
    
    // Return fallback if AI is not configured
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({
        summary: 'AI service not configured. Please set OPENAI_API_KEY in environment variables.',
        suggestions: [],
        risks: [],
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate AI insights' },
      { status: 500 }
    )
  }
}