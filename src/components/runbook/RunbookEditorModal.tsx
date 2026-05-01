import { useRef, useState } from 'react'
import type { MomentCategory } from '../../types/runbook.types'
import { useRunbookStore } from '../../store/runbook.store'
import { AddMomentForm } from './AddMomentForm'

interface Props {
  onClose: () => void
}

export function RunbookEditorModal({ onClose }: Props) {
  const { moments, removeMoment, reorderMoment } = useRunbookStore()
  const [addingIn, setAddingIn] = useState<MomentCategory | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [dragOverCategory, setDragOverCategory] = useState<MomentCategory | null>(null)
  const draggingRef = useRef<{ id: string; category: MomentCategory } | null>(null)

  const escola = moments.filter(m => m.category === 'escola')
  const culto  = moments.filter(m => m.category === 'culto')

  const handleDragStart = (id: string, category: MomentCategory) => {
    draggingRef.current = { id, category }
  }

  const handleDragOver = (e: React.DragEvent, id: string, category: MomentCategory) => {
    e.preventDefault()
    setDragOverId(id)
    setDragOverCategory(category)
  }

  const handleDrop = (e: React.DragEvent, afterId: string, targetCategory: MomentCategory) => {
    e.preventDefault()
    if (!draggingRef.current) return
    const { id } = draggingRef.current
    if (id !== afterId) reorderMoment(id, afterId, targetCategory)
    draggingRef.current = null
    setDragOverId(null)
    setDragOverCategory(null)
  }

  // Drop on empty section (prepend to that category)
  const handleDropOnSection = (e: React.DragEvent, targetCategory: MomentCategory) => {
    e.preventDefault()
    if (!draggingRef.current) return
    const { id } = draggingRef.current
    const list = targetCategory === 'escola' ? escola : culto
    if (list.length === 0) {
      reorderMoment(id, null, targetCategory)
    }
    draggingRef.current = null
    setDragOverId(null)
    setDragOverCategory(null)
  }

  const handleDragEnd = () => {
    draggingRef.current = null
    setDragOverId(null)
    setDragOverCategory(null)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="w-[560px] max-h-[80vh] flex flex-col bg-app-base rounded-xl border border-app-border shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-app-border flex-shrink-0">
          <h2 className="font-semibold text-app-high">Editar Programa</h2>
          <button
            onClick={onClose}
            className="text-app-low hover:text-app-high transition-colors text-lg leading-none"
          >✕</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <EditorSection
            title="Escola Sabatina"
            category="escola"
            items={escola}
            dragOverId={dragOverId}
            dragOverCategory={dragOverCategory}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDropSection={handleDropOnSection}
            onDragEnd={handleDragEnd}
            onRemove={removeMoment}
          />

          <EditorSection
            title="Culto Divino"
            category="culto"
            items={culto}
            dragOverId={dragOverId}
            dragOverCategory={dragOverCategory}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDropSection={handleDropOnSection}
            onDragEnd={handleDragEnd}
            onRemove={removeMoment}
          />
        </div>

        {/* Footer with Add buttons */}
        <div className="px-4 py-3 border-t border-app-border flex-shrink-0 space-y-2">
          {addingIn ? (
            <AddMomentForm
              category={addingIn}
              onAdd={() => setAddingIn(null)}
              onCancel={() => setAddingIn(null)}
            />
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setAddingIn('escola')}
                className="flex-1 py-1.5 text-xs rounded border border-dashed border-app-border text-app-low hover:text-app-high hover:border-app-accent transition-colors"
              >+ Momento à Escola</button>
              <button
                onClick={() => setAddingIn('culto')}
                className="flex-1 py-1.5 text-xs rounded border border-dashed border-app-border text-app-low hover:text-app-high hover:border-app-accent transition-colors"
              >+ Momento ao Culto</button>
            </div>
          )}
          <button
            onClick={onClose}
            className="w-full py-1.5 text-xs rounded border border-app-border text-app-mid hover:bg-app-surface transition-colors"
          >Fechar</button>
        </div>
      </div>
    </div>
  )
}

interface SectionProps {
  title: string
  category: MomentCategory
  items: ReturnType<typeof useRunbookStore.getState>['moments']
  dragOverId: string | null
  dragOverCategory: MomentCategory | null
  onDragStart: (id: string, category: MomentCategory) => void
  onDragOver: (e: React.DragEvent, id: string, category: MomentCategory) => void
  onDrop: (e: React.DragEvent, afterId: string, targetCategory: MomentCategory) => void
  onDropSection: (e: React.DragEvent, targetCategory: MomentCategory) => void
  onDragEnd: () => void
  onRemove: (id: string) => void
}

function EditorSection({
  title, category, items,
  dragOverId, dragOverCategory,
  onDragStart, onDragOver, onDrop, onDropSection, onDragEnd, onRemove,
}: SectionProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-app-low uppercase tracking-wider mb-2">{title}</h3>
      <div
        className="space-y-0.5 min-h-[32px]"
        onDragOver={e => { e.preventDefault() }}
        onDrop={e => onDropSection(e, category)}
      >
        {items.map(m => (
          <div
            key={m.id}
            draggable
            onDragStart={() => onDragStart(m.id, m.category)}
            onDragOver={e => onDragOver(e, m.id, category)}
            onDrop={e => onDrop(e, m.id, category)}
            onDragEnd={onDragEnd}
            className={`flex items-center gap-2 px-3 py-2 rounded border transition-colors cursor-grab active:cursor-grabbing
              ${dragOverId === m.id && dragOverCategory === category
                ? 'border-t-2 border-app-accent bg-app-surface'
                : 'border-app-border bg-app-surface hover:bg-app-base'
              }`}
          >
            <span className="text-app-low select-none text-sm" title="Arrastar">⠿</span>
            <span className="flex-1 text-sm text-app-high truncate">{m.label}</span>
            <button
              onClick={() => onRemove(m.id)}
              className="text-app-low hover:text-red-400 transition-colors text-xs px-1"
              title="Remover"
            >✕</button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="px-3 py-2 text-xs text-app-low italic rounded border border-dashed border-app-border">
            Sem momentos — arraste aqui ou adicione abaixo
          </div>
        )}
      </div>
    </div>
  )
}
