import { useEffect, useState } from 'react'
import { useOBSStore } from '../../store/obs.store'

export function StatusBar() {
  const { isConnected, isStreaming, currentScene } = useOBSStore()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-900 text-sm text-white select-none border-b border-gray-700">
      {/* OBS status */}
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'}`} />
        <span className="text-gray-300">OBS</span>
        {isConnected && currentScene && (
          <span className="text-gray-400">· {currentScene}</span>
        )}
        {!isConnected && (
          <span className="text-red-400">Desligado</span>
        )}
      </div>

      {/* Stream status */}
      {isStreaming && (
        <div className="flex items-center gap-1 text-red-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Stream Ativo
        </div>
      )}

      <div className="flex-1" />

      {/* Clock */}
      <span className="text-gray-300 font-mono tabular-nums">
        {time.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  )
}
