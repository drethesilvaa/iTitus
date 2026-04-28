import { useState } from 'react'
import { useOBSStore } from '../../store/obs.store'
import { useSettingsStore } from '../../store/settings.store'

export function QuickActionsPanel() {
  const { isConnected, isStreaming, currentScene } = useOBSStore()
  const { config } = useSettingsStore()
  const [hymnNumber, setHymnNumber] = useState('')
  const [hymnLoading, setHymnLoading] = useState(false)

  const scenes = config?.scenes ?? { camera: 'Câmara', screenShare: 'Partilha Ecrã', screenWithCam: 'Ecrã + Câmara' }

  const switchScene = (key: keyof typeof scenes) => {
    window.electronAPI.obs.switchScene(scenes[key])
  }

  const openHymn = async () => {
    const num = parseInt(hymnNumber)
    if (!num || num < 1 || num > 695) return
    setHymnLoading(true)
    try {
      const cfg = await window.electronAPI.config.getAll()
      const filename = `${String(num).padStart(3, '0')}.${cfg.hymnExtension}`
      const filePath = `${cfg.hymnBasePath}\\${filename}`
      await window.electronAPI.vlc.play(filePath, cfg.vlcScreenIndex)
    } catch (e) {
      alert(`Erro ao abrir hino: ${e}`)
    } finally {
      setHymnLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Scene buttons */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Cenas OBS</h3>
        {!isConnected && (
          <p className="text-xs text-gray-400 mb-2">OBS não ligado</p>
        )}
        <div className="grid grid-cols-1 gap-2">
          <SceneBtn
            label="Câmara"
            desc="Pessoas, microfones da sala"
            icon="📷"
            active={currentScene === scenes.camera}
            disabled={!isConnected}
            onClick={() => switchScene('camera')}
          />
          <SceneBtn
            label="Partilha de Ecrã"
            desc="Hinos, vídeos, música"
            icon="🖥"
            active={currentScene === scenes.screenShare}
            disabled={!isConnected}
            onClick={() => switchScene('screenShare')}
          />
          <SceneBtn
            label="Ecrã + Câmara"
            desc="Anúncios, apresentações"
            icon="🖥📷"
            active={currentScene === scenes.screenWithCam}
            disabled={!isConnected}
            onClick={() => switchScene('screenWithCam')}
          />
        </div>
      </section>

      {/* Hymn selector */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Abrir Hino</h3>
        <div className="flex gap-2">
          <input
            type="number"
            min={1}
            max={695}
            value={hymnNumber}
            onChange={(e) => setHymnNumber(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && openHymn()}
            placeholder="Nº do hino"
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={openHymn}
            disabled={hymnLoading || !hymnNumber}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {hymnLoading ? '...' : 'Abrir'}
          </button>
        </div>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => window.electronAPI.vlc.stop()}
            className="px-3 py-1.5 text-xs rounded border border-red-200 text-red-600 hover:bg-red-50"
          >
            Parar VLC
          </button>
        </div>
      </section>

      {/* Stream control */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Stream</h3>
        {isStreaming ? (
          <button
            onClick={() => window.electronAPI.obs.stopStream()}
            disabled={!isConnected}
            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Parar Stream
          </button>
        ) : (
          <button
            onClick={() => window.electronAPI.obs.startStream()}
            disabled={!isConnected}
            className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Iniciar Stream
          </button>
        )}
      </section>

      {/* Open file */}
      <section>
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Abrir Ficheiro</h3>
        <button
          onClick={async () => {
            const file = await window.electronAPI.files.openDialog({
              title: 'Selecionar ficheiro de vídeo',
              filters: [{ name: 'Vídeos', extensions: ['mp4', 'mkv', 'avi', 'mov'] }],
            })
            if (file) {
              const cfg = await window.electronAPI.config.getAll()
              await window.electronAPI.vlc.play(file, cfg.vlcScreenIndex)
            }
          }}
          className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          Selecionar e reproduzir...
        </button>
      </section>
    </div>
  )
}

interface SceneBtnProps {
  label: string
  desc: string
  icon: string
  active: boolean
  disabled: boolean
  onClick: () => void
}

function SceneBtn({ label, desc, icon, active, disabled, onClick }: SceneBtnProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all w-full
        ${active
          ? 'border-blue-400 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="text-xl">{icon}</span>
      <div>
        <div className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-800'}`}>{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
      {active && <span className="ml-auto text-blue-500 text-xs font-semibold">ATIVO</span>}
    </button>
  )
}
