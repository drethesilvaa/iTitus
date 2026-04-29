import type { MomentStatus, MomentCategory } from '../../types/runbook.types'

const STATUS_STYLES: Record<MomentStatus, string> = {
  pending: 'bg-app-border text-app-low',
  active:  'bg-app-accent/20 text-app-accent font-semibold',
  done:    'bg-green-900/30 text-green-400',
}

const STATUS_LABELS: Record<MomentStatus, string> = {
  pending: 'Pendente',
  active:  'Ativo',
  done:    'Concluído',
}

const CATEGORY_STYLES: Record<MomentCategory, string> = {
  escola: 'bg-purple-900/30 text-purple-400',
  culto:  'bg-app-accent/20 text-app-accent',
}

export function StatusBadge({ status }: { status: MomentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  )
}

export function CategoryBadge({ category }: { category: MomentCategory }) {
  const labels: Record<MomentCategory, string> = { escola: 'Escola', culto: 'Culto' }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${CATEGORY_STYLES[category]}`}>
      {labels[category]}
    </span>
  )
}
