import { useState, useEffect, useCallback } from 'react'
import { StatusBar } from './components/layout/StatusBar'
import { Sidebar } from './components/layout/Sidebar'
import { RunbookPanel } from './components/runbook/RunbookPanel'
import { QuickActionsPanel } from './components/actions/QuickActionsPanel'
import { DownloaderPanel } from './components/actions/DownloaderPanel'
import { SettingsPanel } from './components/settings/SettingsPanel'
import { ChatPanel } from './components/ai/ChatPanel'
import { useOBS } from './hooks/useOBS'
import { useSettingsStore } from './store/settings.store'

export type TabId = 'culto' | 'acoes' | 'downloads' | 'config'

const PANELS: Record<TabId, React.ReactNode> = {
  culto:     <RunbookPanel />,
  acoes:     <QuickActionsPanel />,
  downloads: <DownloaderPanel />,
  config:    <SettingsPanel />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('culto')
  const { loadConfig } = useSettingsStore()

  // Initialize OBS listeners
  useOBS()

  // Load config on startup
  useEffect(() => {
    loadConfig()
  }, [loadConfig])

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
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
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
  )
}
