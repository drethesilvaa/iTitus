import type { TabId } from '../../App'
import { useSettingsStore } from '../../store/settings.store'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'culto',      label: 'Culto',      icon: '⛪' },
  { id: 'acoes',      label: 'Ações',      icon: '⚡' },
  { id: 'downloads',  label: 'Downloads',  icon: '⬇' },
  { id: 'instrucoes', label: 'Instruções', icon: '📋' },
  { id: 'config',     label: 'Definições', icon: '⚙' },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { config, updateConfig } = useSettingsStore()
  const isDark = config?.theme === 'dark'

  return (
    <aside className="flex flex-col bg-app-deep border-r border-app-border py-4">
      <div className="px-4 mb-6">
        <h1 className="text-app-high font-bold text-sm leading-tight">iTitus</h1>
        <p className="text-app-low text-xs">IASD Paivas</p>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full
              ${activeTab === tab.id
                ? 'bg-app-accent text-app-on-accent'
                : 'text-app-mid hover:bg-app-surface hover:text-app-high'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto px-2 flex flex-col gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => updateConfig('theme', isDark ? 'light' : 'dark')}
          title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          className="w-full px-3 py-2 rounded-lg border border-app-border text-app-mid hover:bg-app-surface hover:text-app-high transition-colors text-sm flex items-center gap-2"
        >
          <span>{isDark ? '☀' : '🌙'}</span>
          <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* Panic Button */}
        <button
          onClick={() => window.electronAPI.app.panic()}
          className="w-full px-3 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-app-high text-sm font-bold transition-colors"
          title="Ctrl+Shift+S — Para todo o média"
        >
          STOP ALL
        </button>
      </div>
    </aside>
  )
}
