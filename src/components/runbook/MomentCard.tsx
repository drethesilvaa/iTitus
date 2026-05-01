import { useState } from 'react'
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
          ? 'border-app-accent bg-app-accent/10 shadow-md'
          : moment.status === 'done'
            ? 'border-green-800 bg-green-900/20 opacity-70'
            : 'border-app-border bg-app-surface'
      }`}
    >
      <div className="flex items-center gap-2">
        {/* Done checkbox */}
        <input
          type="checkbox"
          checked={moment.status === 'done'}
          onChange={(e) => markStatus(moment.id, e.target.checked ? 'done' : 'pending')}
          className="h-4 w-4 rounded border-app-border text-app-accent cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />

        {/* Label + activate */}
        <button
          className="flex-1 text-left text-sm font-medium text-app-high hover:text-app-accent transition-colors"
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
            <div key={i} className="flex items-start gap-1.5 text-xs text-app-accent bg-app-accent/10 rounded px-2 py-1">
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
  const [showHymnInput, setShowHymnInput] = useState(false)
  const [hymnNum, setHymnNum] = useState('')
  const [isValid, setIsValid] = useState(true)

  const handleHymnConfirm = async () => {
    const n = Number(hymnNum)
    if (Number.isInteger(n) && n >= 1 && n <= 695) {
      setIsValid(true)
      const cfg = await window.electronAPI.config.getAll()
      const padded = String(n).padStart(3, '0')
      const path = `${cfg.hymnBasePath}\\${padded}.${cfg.hymnExtension}`
      await window.electronAPI.vlc.play(path, cfg.vlcScreenIndex)
      setShowHymnInput(false)
      setHymnNum('')
    } else {
      setIsValid(false)
    }
  }

  const cancelHymn = () => { setShowHymnInput(false); setHymnNum(''); setIsValid(true) }

  const handleClick = async () => {
    if (action.type === 'set-scene' && action.scene) {
      const cfg = await window.electronAPI.config.getAll()
      const sceneName = cfg.scenes[action.scene as keyof typeof cfg.scenes] ?? action.scene
      await window.electronAPI.obs.switchScene(sceneName)
    } else if (action.type === 'open-hymn') {
      setShowHymnInput(true)
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
      if (!file) return
      const ext = file.split('.').pop()?.toLowerCase() ?? ''
      const VIDEO_EXTS = ['mp4', 'mkv', 'avi', 'mov']
      if (VIDEO_EXTS.includes(ext)) {
        const cfg = await window.electronAPI.config.getAll()
        await window.electronAPI.vlc.play(file, cfg.vlcScreenIndex)
      } else {
        await window.electronAPI.files.openPath(file)
      }
    }
  }

  if (action.type === 'open-hymn' && showHymnInput) {
    return (
      <>
        <input
          type="number"
          min={1}
          max={695}
          autoFocus
          value={hymnNum}
          onChange={e => { setHymnNum(e.target.value); setIsValid(true) }}
          onKeyDown={e => { if (e.key === 'Enter') handleHymnConfirm(); if (e.key === 'Escape') cancelHymn() }}
          placeholder="Nº 1–695"
          className={`w-24 px-2 py-1 rounded text-xs bg-app-surface text-app-high border border-app-border focus:outline-none ${!isValid ? 'ring-2 ring-red-500' : 'focus:ring-2 focus:ring-app-accent/50'}`}
        />
        <button
          onClick={handleHymnConfirm}
          className="px-2.5 py-1 rounded text-xs bg-app-accent hover:bg-app-accent-hover text-app-on-accent border border-app-accent transition-colors"
        >▶ OK</button>
        <button
          onClick={cancelHymn}
          className="px-2 py-1 rounded text-xs bg-app-border hover:bg-app-surface text-app-mid border border-app-border transition-colors"
        >✕</button>
      </>
    )
  }

  const LABELS: Record<string, string> = {
    'set-scene':   `Cena: ${action.scene ?? ''}`,
    'open-hymn':   'Abrir Hino',
    'open-file':   'Abrir Ficheiro',
    'stop-stream': 'Parar Stream',
    'start-stream':'Iniciar Stream',
  }

  return (
    <button
      onClick={handleClick}
      className="px-2.5 py-1 rounded text-xs bg-app-border hover:bg-app-surface text-app-mid border border-app-border transition-colors"
    >
      {LABELS[action.type] ?? action.type}
    </button>
  )
}
