import OpenAI from 'openai'
import { configStore } from './config.service.js'
import { logger } from './logger.service.js'

export interface ParsedAction {
  action: string
  params?: Record<string, unknown>
}

export interface AIResult {
  text: string
  action: ParsedAction | null
}

function buildSystemPrompt(availableScenes: string[]): string {
  const sceneList = availableScenes.length > 0
    ? availableScenes.map(s => `- "${s}"`).join('\n')
    : '(cenas não disponíveis — OBS não ligado)'

  return `És o assistente de multimédia da Igreja Adventista do Sétimo Dia de Paivas.
Ajudas o operador de som e imagem durante a Escola Sabatina e o Culto.
Respondes SEMPRE em português de Portugal. Sê conciso — o operador está ocupado.

Cenas OBS disponíveis neste momento:
${sceneList}

IMPORTANTE: Nunca inventes nomes de cenas que não estejam na lista acima.
Se o operador pedir uma cena que não reconheces, responde com uma pergunta de confirmação.
Exemplo: "Não encontrei essa cena. Queres que use '${availableScenes[0] ?? 'Câmara'}'?"

Quando dás instruções de hardware, usa este formato:
🔧 HARDWARE: [instrução clara e directa]

Se houver uma ação de software para executar, termina a resposta com JSON neste formato exacto:
{"action": "SWITCH_SCENE", "params": {"scene": "Nome da Cena"}}
ou {"action": "PLAY_HYMN", "params": {"number": 245}}
ou {"action": "START_STREAM"}
ou {"action": "STOP_STREAM"}
ou {"action": "NONE"} se não houver ação.

Se não houver ação de software, não incluas JSON na resposta.`
}

class AIService {
  private client: OpenAI | null = null
  private history: OpenAI.Chat.ChatCompletionMessageParam[] = []
  private availableScenes: string[] = []

  setAvailableScenes(scenes: string[]): void {
    this.availableScenes = scenes
  }

  private getClient(): OpenAI {
    const key = configStore.get('openRouterApiKey')
    if (!key) throw new Error('Chave API do OpenRouter não configurada nas definições.')
    if (!this.client) {
      this.client = new OpenAI({
        apiKey: key,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://iasd-paivas-multimedia',
          'X-Title': 'IASD Paivas Multimedia',
        },
      })
    }
    return this.client
  }

  resetClient(): void {
    this.client = null
  }

  async sendMessage(userMessage: string): Promise<AIResult> {
    const client = this.getClient()
    const model = configStore.get('openRouterModel')

    this.history.push({ role: 'user', content: userMessage })

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt(this.availableScenes) },
        ...this.history,
      ],
      max_tokens: 800,
    })

    const content = response.choices[0]?.message?.content ?? ''
    this.history.push({ role: 'assistant', content })

    const action = this.parseAction(content)
    // Remove the JSON block from the displayed text
    const text = content.replace(/\{[\s\S]*?"action"[\s\S]*?\}/g, '').trim()

    logger.info(`[AI] Mensagem enviada: "${userMessage.slice(0, 50)}"`)
    if (action && action.action !== 'NONE') {
      logger.info(`[AI] Ação interpretada: ${action.action}`)
    }

    return { text, action: action?.action === 'NONE' ? null : action ?? null }
  }

  private parseAction(content: string): ParsedAction | null {
    const match = content.match(/\{[\s\S]*?"action"[\s\S]*?\}/)
    if (!match) return null
    try {
      return JSON.parse(match[0]) as ParsedAction
    } catch {
      return null
    }
  }

  clearHistory(): void {
    this.history = []
  }
}

export const aiService = new AIService()
