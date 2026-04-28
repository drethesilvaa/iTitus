import type { Moment } from '../../types/runbook.types'
import { StatusBadge } from './MomentBadge'
import { useRunbookStore } from '../../store/runbook.store'

interface MomentCardProps {
  moment: Moment
  isActive: boolean
}

const SCENE_ICONS: Record<string, string> = {
  camera:        '📷',
  screenShare:   '🖥',
  screenWithCam: '🖥📷',
}

export function MomentCard({ moment, isActive }: MomentCardProps) {
  const { setActiveMoment, markStatus } = useRunbookStore()

  return (
    <div
      className={`rounded-lg border p-3 transition-all ${
        isActive
          ? 'border-blue-400 bg-blue-50 shadow-md'
          : moment.status === 'done'
            ? 'border-green-200 bg-green-50 opacity-70'
            : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Done checkbox */}
        <input
          type="checkbox"
          checked={moment.status === 'done'}
          onChange={(e) => markStatus(moment.id, e.target.checked ? 'done' : 'pending')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Label + activate */}
        <button
          className="flex-1 text-left text-sm font-medium text-gray-800 hover:text-blue-600"
          onClick={() => setActiveMoment(moment.id)}
        >
          {moment.label}
        </button>

        {moment.sceneHint && (
          <span className="text-base" title={moment.sceneHint}>
            {SCENE_ICONS[moment.sceneHint]}
          </span>
        )}

        <StatusBadge status={moment.status} />
      </div>

      {/* Hardware instructions */}
      {isActive && moment.hardwareInstructions && (
        <div className="mt-2 space-y-1">
          {moment.hardwareInstructions.map((inst, i) => (
            <div key={i} className="flex items-start gap-1.5 text-xs text-orange-700 bg-orange-50 rounded px-2 py-1">
              <span>🔧</span>
              <span>{inst}</span>
            </div>
          ))}
        </div>
      )}

      {/* Software action buttons */}
      {isActive && moment.softwareActions && (
        <div className="mt-2 flex flex-wrap gap-1">
          {moment.softwareActions.map((action, i) => (
            <ActionButton key={i} action={action} moment={moment} />
          ))}
        </div>
      )}
    </div>
  )
}

function ActionButton({ action, moment }: { action: Moment['softwareActions'][0]; moment: Moment }) {
  const handleClick = async () => {
    if (action.type === 'set-scene' && action.scene) {
      const cfg = await window.electronAPI.config.getAll()
      const sceneName = cfg.scenes[action.scene as keyof typeof cfg.scenes] ?? action.scene
      await window.electronAPI.obs.switchScene(sceneName)
    } else if (action.type === 'open-hymn') {
      // Opens HymnSelector — handled by parent panel via event / store
      document.dispatchEvent(new CustomEvent('open-hymn-selector'))
    } else if (action.type === 'stop-stream') {
      await window.electronAPI.obs.stopStream()
    } else if (action.type === 'open-file') {
      const file = await window.electronAPI.files.openDialog({
        title: action.hint ?? 'Selecionar ficheiro',
        filters: [
          { name: 'Vídeos', extensions: ['mp4', 'mkv', 'avi', 'mov'] },
          { name: 'PowerPoint', extensions: ['pptx', 'ppt'] },
          { name: 'Todos', extensions: ['*'] },
        ],
      })
      if (file) await window.electronAPI.files.openPath(file)
    }
  }

  const LABELS: Record<string, string> = {
    'set-scene':  `Cena: ${action.scene ?? ''}`,
    'open-hymn':  'Abrir Hino',
    'open-file':  'Abrir Ficheiro',
    'stop-stream': 'Parar Stream',
    'start-stream':'Iniciar Stream',
  }

  return (
    <button
      onClick={handleClick}
      className="px-2.5 py-1 rounded text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-colors"
    >
      {LABELS[action.type] ?? action.type}
    </button>
  )
}
