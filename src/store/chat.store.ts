import { create } from 'zustand'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  actionTaken?: string
  isError?: boolean
}

interface ChatStore {
  messages: ChatMessage[]
  isLoading: boolean
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setLoading: (v: boolean) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  isLoading: false,
  addMessage: (msg) =>
    set(state => ({
      messages: [...state.messages, {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }],
    })),
  setLoading: (v) => set({ isLoading: v }),
  clearMessages: () => set({ messages: [] }),
}))
