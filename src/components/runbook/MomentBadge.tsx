import type { MomentStatus, MomentCategory } from '../../types/runbook.types'

const STATUS_STYLES: Record<MomentStatus, string> = {
  pending: 'bg-gray-100 text-gray-500',
  active:  'bg-blue-100 text-blue-700 font-semibold',
  done:    'bg-green-100 text-green-700',
}

const STATUS_LABELS: Record<MomentStatus, string> = {
  pending: 'Pendente',
  active:  'Ativo',
  done:    'Concluído',
}

const CATEGORY_STYLES: Record<MomentCategory, string> = {
  escola: 'bg-purple-100 text-purple-700',
  culto:  'bg-blue-100 text-blue-700',
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
