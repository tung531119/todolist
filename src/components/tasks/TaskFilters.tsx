import { Filter, X } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { Status, Priority } from '../../types'
import { cn } from '../../utils/cn'

const STATUSES: Status[] = ['pending', 'in-progress', 'completed']
const PRIORITIES: Priority[] = ['high', 'medium', 'low']

export function TaskFilters() {
  const { t } = useLang()
  const categories = useStore(s => s.categories)
  const ui = useStore(s => s.ui)
  const setUI = useStore(s => s.setUI)

  const hasFilters = ui.categoryFilter.length > 0 || ui.statusFilter.length > 0 || ui.priorityFilter.length > 0

  function toggleCategory(id: string) {
    setUI({
      categoryFilter: ui.categoryFilter.includes(id)
        ? ui.categoryFilter.filter(c => c !== id)
        : [...ui.categoryFilter, id],
    })
  }

  function toggleStatus(s: Status) {
    setUI({
      statusFilter: ui.statusFilter.includes(s)
        ? ui.statusFilter.filter(x => x !== s)
        : [...ui.statusFilter, s],
    })
  }

  function togglePriority(p: Priority) {
    setUI({
      priorityFilter: ui.priorityFilter.includes(p)
        ? ui.priorityFilter.filter(x => x !== p)
        : [...ui.priorityFilter, p],
    })
  }

  function clearAll() {
    setUI({ categoryFilter: [], statusFilter: [], priorityFilter: [] })
  }

  const statusColor: Record<Status, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-300',
    'in-progress': 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  }

  const priorityColor: Record<Priority, string> = {
    high: 'bg-red-100 text-red-700 border-red-300',
    medium: 'bg-orange-100 text-orange-700 border-orange-300',
    low: 'bg-slate-100 text-slate-600 border-slate-300',
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          <Filter size={14} />
          {t('filters')}
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors">
            <X size={12} />
            {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Status */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wide">{t('status')}</p>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => toggleStatus(s)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs border font-medium transition-all',
                ui.statusFilter.includes(s)
                  ? statusColor[s] + ' ring-1 ring-offset-0'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              )}
            >
              {t(s as any)}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="mb-3">
        <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wide">{t('priority')}</p>
        <div className="flex flex-wrap gap-1.5">
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => togglePriority(p)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs border font-medium transition-all',
                ui.priorityFilter.includes(p)
                  ? priorityColor[p] + ' ring-1'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              )}
            >
              {t(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <p className="text-xs text-slate-400 mb-1.5 uppercase tracking-wide">{t('category')}</p>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCategory(c.id)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs border font-medium transition-all',
                ui.categoryFilter.includes(c.id)
                  ? `bg-${c.color}-100 text-${c.color}-700 border-${c.color}-300 ring-1`
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
              )}
            >
              {c.isCustom ? c.name : t(c.name as any)}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
