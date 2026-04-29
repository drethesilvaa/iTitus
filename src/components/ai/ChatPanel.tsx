import { useState, useRef, useEffect } from 'react'
import { useAI } from '../../hooks/useAI'

export function ChatPanel() {
  const { messages, isLoading, sendMessage, clearChat } = useAI()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || isLoading) return
    setInput('')
    sendMessage(text)
  }

  return (
    <div className="flex flex-col h-full border-l border-app-border bg-app-base">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-app-border bg-app-surface">
        <div>
          <h2 className="font-semibold text-app-high text-sm">iTitus AI</h2>
          <p className="text-xs text-app-low">Fala em português</p>
        </div>
        <button
          onClick={clearChat}
          className="text-xs text-app-low hover:text-app-mid transition-colors"
          title="Limpar conversa"
        >
          Limpar
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-app-low text-xs mt-8">
            <p className="text-2xl mb-2">💬</p>
            <p>Pede ajuda ao assistente.</p>
            <p className="mt-1">Ex: "Muda para câmara" ou "Qual é o hino 245?"</p>
          </div>
        )}

        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-app-accent text-app-deep rounded-br-sm'
                  : msg.isError
                    ? 'bg-red-900/30 text-red-400 border border-red-800 rounded-bl-sm'
                    : 'bg-app-surface text-app-high border border-app-border rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              {msg.actionTaken && (
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full ${
                  msg.role === 'user' ? 'bg-app-accent-dim text-app-deep' : 'bg-app-border text-app-mid'
                }`}>
                  ⚡ {msg.actionTaken}
                </span>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-app-surface border border-app-border rounded-lg rounded-bl-sm px-3 py-2">
              <div className="flex gap-1 items-center h-4">
                <span className="w-1.5 h-1.5 bg-app-mid rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-app-mid rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-app-mid rounded-full animate-bounce" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-app-border bg-app-surface">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
            }}
            placeholder="Escreve aqui... (Enter para enviar)"
            rows={2}
            className="flex-1 resize-none px-3 py-2 border border-app-border bg-app-base text-app-high rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-app-accent/50 placeholder:text-app-low"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-3 py-2 bg-app-accent hover:bg-app-accent-hover text-app-deep rounded-lg disabled:opacity-50 transition-colors self-end"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}
