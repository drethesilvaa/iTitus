import { useChatStore } from '../store/chat.store'

export function useAI() {
  const { messages, isLoading, addMessage, setLoading, clearMessages } = useChatStore()

  const sendMessage = async (text: string) => {
    addMessage({ role: 'user', content: text })
    setLoading(true)
    try {
      const result = await window.electronAPI.ai.sendMessage(text)
      addMessage({
        role: 'assistant',
        content: result.text,
        actionTaken: result.actionTaken ?? undefined,
      })
    } catch (err) {
      addMessage({ role: 'assistant', content: `Erro: ${String(err)}`, isError: true })
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    await window.electronAPI.ai.clearHistory()
    clearMessages()
  }

  return { messages, isLoading, sendMessage, clearChat }
}
