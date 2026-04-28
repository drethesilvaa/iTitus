import type { TabId } from '../../App'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'culto',    label: 'Culto',     icon: '⛪' },
  { id: 'acoes',    label: 'Ações',     icon: '⚡' },
  { id: 'downloads',label: 'Downloads', icon: '⬇' },
  { id: 'config',   label: 'Definições',icon: '⚙' },
]

interface SidebarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="flex flex-col bg-gray-800 border-r border-gray-700 py-4">
      <div className="px-4 mb-6">
        <h1 className="text-white font-bold text-sm leading-tight">IASD Paivas</h1>
        <p className="text-gray-400 text-xs">Assistente Multimedia</p>
      </div>

      <nav className="flex flex-col gap-1 px-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left w-full
              ${activeTab === tab.id
                ? 'bg-adventist-500 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Panic Button */}
      <div className="mt-auto px-2">
        <button
          onClick={() => window.electronAPI.app.panic()}
          className="w-full px-3 py-2.5 rounded-lg bg-red-700 hover:bg-red-600 text-white text-sm font-bold transition-colors"
          title="Ctrl+Shift+S — Para todo o média"
        >
          STOP ALL
        </button>
      </div>
    </aside>
  )
}
