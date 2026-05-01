import { useState, useEffect, useCallback } from 'react'
import { StatusBar } from './components/layout/StatusBar'
import { Sidebar } from './components/layout/Sidebar'
import { RunbookPanel } from './components/runbook/RunbookPanel'
import { QuickActionsPanel } from './components/actions/QuickActionsPanel'
import { DownloaderPanel } from './components/actions/DownloaderPanel'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { ChatPanel } from './components/ai/ChatPanel'
import { InstrucoesPanel } from './components/instrucoes/InstrucoesPanel'
import { OnboardingOverlay } from './components/onboarding/OnboardingOverlay'
import { useOBS } from './hooks/useOBS'
import { useSettingsStore } from './store/settings.store'

export type TabId = 'culto' | 'acoes' | 'downloads' | 'instrucoes' | 'config'

function UpdateBanner() {
  const [available, setAvailable] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const off1 = window.electronAPI.app.onUpdateAvailable(v => setAvailable(v))
    const off2 = window.electronAPI.app.onUpdateReady(() => setReady(true))
    return () => { off1(); off2() }
  }, [])

  if (!available) return null

  return (
    <div className={`flex items-center justify-between px-4 py-2 text-sm font-medium ${
      ready ? 'bg-green-800 text-green-100' : 'bg-yellow-700 text-yellow-100'
    }`}>
      <span>
        {ready
          ? '✓ Atualização pronta para instalar'
          : `⬆ Versão ${available} disponível — a transferir...`}
      </span>
      {ready && (
        <button
          onClick={() => window.electronAPI.app.installUpdate()}
          className="ml-4 px-3 py-1 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
        >
          Reiniciar e instalar
        </button>
      )}
    </div>
  )
}

const PANELS: Record<TabId, React.ReactNode> = {
  culto:      <RunbookPanel />,
  acoes:      <QuickActionsPanel />,
  downloads:  <DownloaderPanel />,
  instrucoes: <InstrucoesPanel />,
  config:     <SettingsPanel />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('culto')
  const { loadConfig, config } = useSettingsStore()

  // Initialize OBS listeners
  useOBS()

  // Load config on startup
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  // Apply theme class to <html>
  useEffect(() => {
    if (config?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [config?.theme])

  // Global keyboard shortcut: Ctrl+Shift+S → Panic
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      window.electronAPI.app.panic()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <>
    {config && !config.onboardingDone && <OnboardingOverlay />}
    <div className="flex h-screen overflow-hidden bg-app-base font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <UpdateBanner />
        <StatusBar />
        <main className="flex-1 overflow-hidden">
          {PANELS[activeTab]}
        </main>
      </div>

      {/* AI Chat — always visible on right */}
      <div className="w-80 flex-shrink-0">
        <ChatPanel />
      </div>
    </div>
    </>
  )
}
