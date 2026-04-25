import { cn } from '../../utils/cn'
import type { Status, Priority } from '../../types'

// ── Status Badge ─────────────────────────────────────────────────────────────
const statusStyles: Record<Status, string> = {
  pending:     'bg-amber-100 text-amber-700 border-amber-200',
  'in-progress': 'bg-blue-100 text-blue-700 border-blue-200',
  completed:   'bg-emerald-100 text-emerald-700 border-emerald-200',
}
const statusDot: Record<Status, string> = {
  pending:       'bg-amber-400',
  'in-progress': 'bg-blue-400',
  completed:     'bg-emerald-400',
}

interface StatusBadgeProps { status: Status; label: string; className?: string }
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
      statusStyles[status], className
    )}>
      <span className={cn('w-1.5 h-1.5 rounded-full', statusDot[status])} />
      {label}
    </span>
  )
}

// ── Priority Badge ────────────────────────────────────────────────────────────
const priorityStyles: Record<Priority, string> = {
  low:    'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-orange-100 text-orange-700 border-orange-200',
  high:   'bg-red-100 text-red-700 border-red-200',
}

interface PriorityBadgeProps { priority: Priority; label: string; className?: string }
export function PriorityBadge({ priority, label, className }: PriorityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      priorityStyles[priority], className
    )}>
      {label}
    </span>
  )
}

// ── Category Badge ────────────────────────────────────────────────────────────
const colorMap: Record<string, string> = {
  indigo:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  violet:  'bg-violet-100 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  amber:   'bg-amber-100 text-amber-700 border-amber-200',
  sky:     'bg-sky-100 text-sky-700 border-sky-200',
  rose:    'bg-rose-100 text-rose-700 border-rose-200',
  teal:    'bg-teal-100 text-teal-700 border-teal-200',
  pink:    'bg-pink-100 text-pink-700 border-pink-200',
}
export const categoryColorMap = colorMap
export const categoryDotMap: Record<string, string> = {
  indigo:  'bg-indigo-500',
  violet:  'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  sky:     'bg-sky-500',
  rose:    'bg-rose-500',
  teal:    'bg-teal-500',
  pink:    'bg-pink-500',
}

interface CategoryBadgeProps { color: string; label: string; className?: string }
export function CategoryBadge({ color, label, className }: CategoryBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      colorMap[color] ?? 'bg-slate-100 text-slate-600 border-slate-200',
      className
    )}>
      {label}
    </span>
  )
}
