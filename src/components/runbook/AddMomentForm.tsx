import { useState } from 'react'
import type { MomentCategory, SoftwareAction, SoftwareActionType } from '../../types/runbook.types'
import { useRunbookStore } from '../../store/runbook.store'

interface Props {
  category: MomentCategory
  onAdd: () => void
  onCancel: () => void
}

type DraftAction = { _key: number; type: SoftwareActionType; scene?: string; hint?: string }

const SCENE_OPTIONS = [
  { value: 'camera', label: 'Câmara' },
  { value: 'screenShare', label: 'Partilha Ecrã' },
  { value: 'screenWithCam', label: 'Ecrã + Câmara' },
]

const HARDWARE_PRESETS = ['Verificar microfones', 'Ligar projetor', 'Confirmar câmara']

let keyCounter = 0
const nextKey = () => ++keyCounter

export function AddMomentForm({ category, onAdd, onCancel }: Props) {
  const { addMoment } = useRunbookStore()
  const [label, setLabel] = useState('')
  const [sceneHint, setSceneHint] = useState<string>('')
  const [hardware, setHardware] = useState<{ _key: number; value: string }[]>([])
  const [actions, setActions] = useState<DraftAction[]>([])
  const [error, setError] = useState('')

  const addHardware = (value = '') =>
    setHardware(prev => [...prev, { _key: nextKey(), value }])

  const updateHardware = (key: number, value: string) =>
    setHardware(prev => prev.map(h => h._key === key ? { ...h, value } : h))

  const removeHardware = (key: number) =>
    setHardware(prev => prev.filter(h => h._key !== key))

  const addAction = () =>
    setActions(prev => [...prev, { _key: nextKey(), type: 'set-scene', scene: '' }])

  const updateAction = (key: number, patch: Partial<DraftAction>) =>
    setActions(prev => prev.map(a => a._key === key ? { ...a, ...patch } : a))

  const removeAction = (key: number) =>
    setActions(prev => prev.filter(a => a._key !== key))

  const handleSubmit = () => {
    if (!label.trim()) { setError('O nome do momento é obrigatório.'); return }
    const invalidScene = actions.find(a => a.type === 'set-scene' && !a.scene)
    if (invalidScene) { setError('Todas as ações "Mudar Cena" precisam de uma cena selecionada.'); return }
    setError('')

    const softwareActions: SoftwareAction[] = actions.map(({ type, scene, hint }) => ({
      type,
      ...(scene ? { scene } : {}),
      ...(hint ? { hint } : {}),
    }))

    addMoment({
      label: label.trim(),
      category,
      sceneHint: (sceneHint as 'camera' | 'screenShare' | 'screenWithCam') || undefined,
      hardwareInstructions: hardware.map(h => h.value).filter(Boolean),
      softwareActions: softwareActions.length ? softwareActions : undefined,
    })
    onAdd()
  }

  return (
    <div className="mt-2 p-3 rounded-lg border border-app-accent/40 bg-app-surface space-y-3">
      {/* Label */}
      <div>
        <label className="block text-xs text-app-low mb-1">Nome do momento *</label>
        <input
          type="text"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Ex: Oração de abertura"
          className="w-full bg-app-base border border-app-border rounded px-2 py-1.5 text-sm text-app-high placeholder:text-app-low focus:outline-none focus:border-app-accent"
          autoFocus
        />
      </div>

      {/* Scene hint */}
      <div>
        <label className="block text-xs text-app-low mb-1">Cena OBS (opcional)</label>
        <select
          value={sceneHint}
          onChange={e => setSceneHint(e.target.value)}
          className="w-full bg-app-base border border-app-border rounded px-2 py-1.5 text-sm text-app-high focus:outline-none focus:border-app-accent"
        >
          <option value="">— nenhuma —</option>
          {SCENE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Hardware instructions */}
      <div>
        <label className="block text-xs text-app-low mb-1">Instruções de hardware</label>
        <div className="space-y-1">
          {hardware.map(h => (
            <div key={h._key} className="flex gap-1">
              <input
                type="text"
                value={h.value}
                onChange={e => updateHardware(h._key, e.target.value)}
                className="flex-1 bg-app-base border border-app-border rounded px-2 py-1 text-sm text-app-high focus:outline-none focus:border-app-accent"
              />
              <button
                onClick={() => removeHardware(h._key)}
                className="px-2 text-app-low hover:text-red-400 transition-colors"
              >✕</button>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {HARDWARE_PRESETS.map(p => (
            <button
              key={p}
              onClick={() => addHardware(p)}
              className="px-2 py-0.5 text-xs rounded border border-app-border text-app-low hover:text-app-high hover:border-app-accent transition-colors"
            >+ {p}</button>
          ))}
          <button
            onClick={() => addHardware()}
            className="px-2 py-0.5 text-xs rounded border border-dashed border-app-border text-app-low hover:text-app-high transition-colors"
          >+ Personalizada</button>
        </div>
      </div>

      {/* Software actions */}
      <div>
        <label className="block text-xs text-app-low mb-1">Ações de software</label>
        <div className="space-y-1">
          {actions.map(a => (
            <div key={a._key} className="flex gap-1 items-center">
              <select
                value={a.type}
                onChange={e => updateAction(a._key, { type: e.target.value as SoftwareActionType, scene: '', hint: '' })}
                className="bg-app-base border border-app-border rounded px-2 py-1 text-xs text-app-high focus:outline-none focus:border-app-accent"
              >
                <option value="set-scene">Mudar Cena</option>
                <option value="open-hymn">Abrir Hino</option>
                <option value="open-file">Abrir Ficheiro</option>
                <option value="start-stream">Iniciar Stream</option>
                <option value="stop-stream">Parar Stream</option>
              </select>

              {a.type === 'set-scene' && (
                <select
                  value={a.scene ?? ''}
                  onChange={e => updateAction(a._key, { scene: e.target.value })}
                  className="flex-1 bg-app-base border border-app-border rounded px-2 py-1 text-xs text-app-high focus:outline-none focus:border-app-accent"
                >
                  <option value="">— escolher cena —</option>
                  {SCENE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              )}

              {a.type === 'open-file' && (
                <input
                  type="text"
                  value={a.hint ?? ''}
                  onChange={e => updateAction(a._key, { hint: e.target.value })}
                  placeholder="Descrição do ficheiro"
                  className="flex-1 bg-app-base border border-app-border rounded px-2 py-1 text-xs text-app-high placeholder:text-app-low focus:outline-none focus:border-app-accent"
                />
              )}

              <button
                onClick={() => removeAction(a._key)}
                className="px-2 text-app-low hover:text-red-400 transition-colors text-xs"
              >✕</button>
            </div>
          ))}
        </div>
        <button
          onClick={addAction}
          className="mt-1 px-2 py-0.5 text-xs rounded border border-dashed border-app-border text-app-low hover:text-app-high transition-colors"
        >+ Adicionar ação</button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs rounded border border-app-border text-app-mid hover:bg-app-surface transition-colors"
        >Cancelar</button>
        <button
          onClick={handleSubmit}
          className="px-3 py-1.5 text-xs rounded bg-app-accent text-white hover:opacity-90 transition-opacity"
        >Adicionar</button>
      </div>
    </div>
  )
}
