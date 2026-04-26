import { cn } from '../../utils/cn'
import type { Status, Priority } from '../../types'

// ── Status Badge ─────────────────────────────────────────────────────────────
const statusStyles: Record<Status, string> = {
  pending:       'bg-zinc-100 text-zinc-600 border-zinc-200',
  'in-progress': 'bg-blue-50 text-blue-700 border-blue-100',
  completed:     'bg-emerald-50 text-emerald-700 border-emerald-100',
}
const statusDot: Record<Status, string> = {
  pending:       'bg-zinc-400',
  'in-progress': 'bg-blue-500',
  completed:     'bg-emerald-500',
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
  low:    'bg-zinc-50 text-zinc-500 border-zinc-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  high:   'bg-red-50 text-red-700 border-red-100',
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
  indigo:  'bg-indigo-50 text-indigo-600 border-indigo-100',
  violet:  'bg-violet-50 text-violet-600 border-violet-100',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber:   'bg-amber-50 text-amber-700 border-amber-100',
  sky:     'bg-sky-50 text-sky-700 border-sky-100',
  rose:    'bg-rose-50 text-rose-700 border-rose-100',
  teal:    'bg-teal-50 text-teal-700 border-teal-100',
  pink:    'bg-pink-50 text-pink-700 border-pink-100',
}
export const categoryColorMap = colorMap
export const categoryDotMap: Record<string, string> = {
  indigo:  'bg-indigo-400',
  violet:  'bg-violet-400',
  emerald: 'bg-emerald-400',
  amber:   'bg-amber-400',
  sky:     'bg-sky-400',
  rose:    'bg-rose-400',
  teal:    'bg-teal-400',
  pink:    'bg-pink-400',
}

interface CategoryBadgeProps { color: string; label: string; className?: string }
export function CategoryBadge({ color, label, className }: CategoryBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
      colorMap[color] ?? 'bg-zinc-50 text-zinc-500 border-zinc-200',
      className
    )}>
      {label}
    </span>
  )
}
