// AI Provider Abstraction Layer
// Supports OpenAI, Anthropic, or any other provider

export interface AIProvider {
  generateText(prompt: string, options?: AIOptions): Promise<string>
  summarizeText(text: string): Promise<string>
  generateSuggestions(context: string): Promise<string[]>
}

export interface AIOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

class OpenAIProvider implements AIProvider {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
    this.baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant for a digital agency. Provide concise, professional responses.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: options.temperature || 0.7,
          max_tokens: options.maxTokens || 500,
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    } catch (error) {
      console.error('AI generation error:', error)
      throw error
    }
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `Summarize the following text in 2-3 sentences:\n\n${text}`
    return this.generateText(prompt, { temperature: 0.3, maxTokens: 150 })
  }

  async generateSuggestions(context: string): Promise<string[]> {
    const prompt = `Based on the following context, provide 3 actionable suggestions:\n\n${context}\n\nFormat as a numbered list.`
    const response = await this.generateText(prompt, { temperature: 0.8, maxTokens: 300 })
    return response
      .split('\n')
      .filter((line) => line.trim().match(/^\d+\./))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 3)
  }
}

class AnthropicProvider implements AIProvider {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY || ''
  }

  async generateText(prompt: string, options: AIOptions = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Anthropic API key not configured')
    }

    // Similar implementation for Anthropic
    // This is a placeholder - implement based on Anthropic API
    throw new Error('Anthropic provider not yet implemented')
  }

  async summarizeText(text: string): Promise<string> {
    throw new Error('Anthropic provider not yet implemented')
  }

  async generateSuggestions(context: string): Promise<string[]> {
    throw new Error('Anthropic provider not yet implemented')
  }
}

// Factory function to get the configured AI provider
export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || 'openai'

  switch (provider) {
    case 'openai':
      return new OpenAIProvider()
    case 'anthropic':
      return new AnthropicProvider()
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }
}

// Helper functions for common AI tasks
export async function summarizeClientHistory(notes: string[]): Promise<string> {
  const ai = getAIProvider()
  const combinedNotes = notes.join('\n\n')
  return ai.summarizeText(combinedNotes)
}

export async function generateFollowUpSuggestions(context: string): Promise<string[]> {
  const ai = getAIProvider()
  return ai.generateSuggestions(context)
}

export async function identifyRisks(notes: string[]): Promise<string[]> {
  const ai = getAIProvider()
  const combinedNotes = notes.join('\n\n')
  const prompt = `Analyze the following client notes and identify potential risks (late payments, expiring services, project delays, etc.). List them concisely:\n\n${combinedNotes}`
  
  const response = await ai.generateText(prompt, { temperature: 0.5, maxTokens: 200 })
  return response
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => line.replace(/^[-•]\s*/, '').trim())
}