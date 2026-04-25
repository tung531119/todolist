import { useEffect, useMemo, useState } from 'react'
import { Plus, CheckCircle2, Circle, ClipboardList, AlertCircle, ChevronDown } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { formatDisplay, isToday, fromDateString } from '../../utils/date'
import { TaskCard } from '../tasks/TaskCard'
import { TaskFilters } from '../tasks/TaskFilters'
import { Modal } from '../common/Modal'
import { TaskForm } from '../tasks/TaskForm'
import { StorageBanner } from '../common/StorageBanner'
import type { TaskInstance } from '../../types'
import { cn } from '../../utils/cn'

export function DayView() {
  const { t, lang } = useLang()
  const selectedDate = useStore(s => s.ui.selectedDate)
  const instances = useStore(s => s.instances)
  const ui = useStore(s => s.ui)
  const addInstance = useStore(s => s.addInstance)
  const ensureInstances = useStore(s => s.ensureInstances)

  const [addOpen, setAddOpen] = useState(false)
  const [notFinishedOpen, setNotFinishedOpen] = useState(true)

  useEffect(() => {
    ensureInstances([selectedDate])
  }, [selectedDate])

  const overdueInstances = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (selectedDate !== today) return []
    return instances
      .filter(i => i.date < selectedDate && (i.status === 'pending' || i.status === 'in-progress'))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [instances, selectedDate])

  const dayInstances = useMemo(() => {
    let list = instances.filter(i => i.date === selectedDate)
    if (ui.categoryFilter.length > 0) list = list.filter(i => ui.categoryFilter.includes(i.categoryId))
    if (ui.statusFilter.length > 0)   list = list.filter(i => ui.statusFilter.includes(i.status))
    if (ui.priorityFilter.length > 0) list = list.filter(i => ui.priorityFilter.includes(i.priority))

    const statusOrder   = { pending: 0, 'in-progress': 1, completed: 2 }
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return list.sort((a, b) => {
      const sd = statusOrder[a.status] - statusOrder[b.status]
      return sd !== 0 ? sd : priorityOrder[a.priority] - priorityOrder[b.priority]
    })
  }, [instances, selectedDate, ui.categoryFilter, ui.statusFilter, ui.priorityFilter])

  const total     = instances.filter(i => i.date === selectedDate).length
  const completed = instances.filter(i => i.date === selectedDate && i.status === 'completed').length
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100)

  const todayDate = isToday(fromDateString(selectedDate))
  const dateLabel = formatDisplay(selectedDate, lang === 'zh' ? 'yyyy年M月d日' : 'EEEE, MMMM d')
  const grouped   = groupByStatus(dayInstances)

  return (
    <div className="flex flex-col md:flex-row gap-5 items-start">

      {/* ── Left panel: date info + filters ─────────────────────────────── */}
      <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 md:sticky md:top-0">

        {/* Date card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className={cn('text-xs font-semibold uppercase tracking-widest mb-1',
            todayDate ? 'text-indigo-500' : 'text-slate-400')}>
            {todayDate ? t('today') : formatDisplay(selectedDate, 'EEE')}
          </p>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{dateLabel}</h1>

          {/* Progress ring */}
          {total > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="22" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="22"
                    fill="none"
                    stroke={progress === 100 ? '#10b981' : '#6366f1'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
                  {progress}%
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <Stat icon={<ClipboardList size={14} />} value={total}     label={t('total')}     color="text-slate-500" />
                <Stat icon={<Circle size={14} />}        value={instances.filter(i => i.date === selectedDate && i.status === 'pending').length} label={t('pending')} color="text-amber-500" />
                <Stat icon={<CheckCircle2 size={14} />}  value={completed} label={t('completed')} color="text-emerald-500" />
                {overdueInstances.length > 0 && (
                  <Stat icon={<AlertCircle size={14} />} value={overdueInstances.length} label={t('notFinished')} color="text-rose-500" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <TaskFilters />
      </div>

      {/* ── Right panel: tasks ───────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4">
        <StorageBanner />

        {/* Not Finished */}
        {todayDate && overdueInstances.length > 0 && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 overflow-hidden">
            <button
              onClick={() => setNotFinishedOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-100/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <AlertCircle size={15} className="text-rose-500" />
                <span className="text-sm font-semibold text-rose-700">{t('notFinished')}</span>
                <span className="bg-rose-200 text-rose-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {overdueInstances.length}
                </span>
              </div>
              <ChevronDown size={15} className={cn('text-rose-400 transition-transform', notFinishedOpen && 'rotate-180')} />
            </button>
            {notFinishedOpen && (
              <div className="px-4 pb-4 flex flex-col gap-2 animate-slide-in">
                <p className="text-xs text-rose-400 mb-1">{t('notFinishedDesc')}</p>
                {overdueInstances.map(instance => (
                  <div key={instance.id} className="relative">
                    <span className="absolute -top-1.5 right-2 z-10 text-[10px] bg-rose-100 text-rose-400 px-1.5 py-0.5 rounded-full border border-rose-200">
                      {formatDisplay(instance.date, lang === 'zh' ? 'M/d' : 'MMM d')}
                    </span>
                    <TaskCard instance={instance} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Today's tasks */}
        {dayInstances.length === 0 ? (
          <EmptyState
            hasFilters={ui.categoryFilter.length > 0 || ui.statusFilter.length > 0 || ui.priorityFilter.length > 0}
            onAdd={() => setAddOpen(true)}
            t={t}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {grouped.pending.length > 0 && (
              <TaskGroup label={t('pending')} tasks={grouped.pending} accent="amber" />
            )}
            {grouped['in-progress'].length > 0 && (
              <TaskGroup label={t('in-progress')} tasks={grouped['in-progress']} accent="blue" />
            )}
            {grouped.completed.length > 0 && (
              <TaskGroup label={t('completed')} tasks={grouped.completed} accent="emerald" />
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title={t('addTask')}
      >
        <Plus size={22} />
      </button>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addTask')}>
        <TaskForm
          defaultDate={selectedDate}
          onSave={data => { addInstance(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  )
}

function TaskGroup({ label, tasks, accent }: { label: string; tasks: TaskInstance[]; accent: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`text-sm font-bold uppercase tracking-wide text-${accent}-600`}>{label}</span>
        <span className={`text-sm font-semibold text-${accent}-400`}>{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {tasks.map(t => <TaskCard key={t.id} instance={t} />)}
      </div>
    </div>
  )
}

function Stat({ icon, value, label, color }: { icon: React.ReactNode; value: number; label: string; color: string }) {
  return (
    <div className={`flex items-center gap-1.5 ${color}`}>
      {icon}
      <span className="text-sm font-bold text-slate-700">{value}</span>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  )
}

function EmptyState({ hasFilters, onAdd, t }: { hasFilters: boolean; onAdd: () => void; t: (k: any) => string }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <ClipboardList size={20} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500 mb-1">
        {hasFilters ? t('noTasksFilter') : t('noTasksDay')}
      </p>
      {!hasFilters && (
        <button onClick={onAdd} className="mt-3 text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors">
          {t('addFirstTask')} →
        </button>
      )}
    </div>
  )
}

function groupByStatus(tasks: TaskInstance[]) {
  return {
    pending:       tasks.filter(t => t.status === 'pending'),
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    completed:     tasks.filter(t => t.status === 'completed'),
  }
}
