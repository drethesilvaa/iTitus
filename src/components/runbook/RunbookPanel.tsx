import { useRunbookStore } from '../../store/runbook.store'
import { MomentCard } from './MomentCard'

export function RunbookPanel() {
  const { moments, activeMomentId, resetRunbook } = useRunbookStore()

  const escola = moments.filter(m => m.category === 'escola')
  const culto  = moments.filter(m => m.category === 'culto')
  const done   = moments.filter(m => m.status === 'done').length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <h2 className="font-semibold text-gray-800">Programa do Culto</h2>
          <p className="text-xs text-gray-500">{done}/{moments.length} momentos concluídos</p>
        </div>
        <button
          onClick={() => { if (confirm('Reiniciar programa?')) resetRunbook() }}
          className="px-3 py-1.5 text-xs rounded border border-gray-200 hover:bg-gray-50 text-gray-600"
        >
          Reiniciar
        </button>
      </div>

      {/* Scrollable moment list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <Section title="Escola Sabatina">
          {escola.map(m => (
            <MomentCard key={m.id} moment={m} isActive={m.id === activeMomentId} />
          ))}
        </Section>

        <Section title="Culto Divino">
          {culto.map(m => (
            <MomentCard key={m.id} moment={m} isActive={m.id === activeMomentId} />
          ))}
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}
