import { useEffect, useMemo, useState } from 'react'
import {
  Plus, CheckCircle2, Circle, ClipboardList,
  AlertCircle, ChevronDown, RefreshCw, Sparkles, Target, Filter, X,
} from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { formatDisplay, isToday, fromDateString } from '../../utils/date'
import { TaskCard } from '../tasks/TaskCard'
import { Modal } from '../common/Modal'
import { TaskForm } from '../tasks/TaskForm'
import { StorageBanner } from '../common/StorageBanner'
import type { TaskInstance, Status, Priority } from '../../types'
import { cn } from '../../utils/cn'

export function DayView() {
  const { t, lang } = useLang()
  const selectedDate = useStore(s => s.ui.selectedDate)
  const instances    = useStore(s => s.instances)
  const categories   = useStore(s => s.categories)
  const ui           = useStore(s => s.ui)
  const setUI        = useStore(s => s.setUI)
  const addInstance  = useStore(s => s.addInstance)
  const ensureInstances = useStore(s => s.ensureInstances)

  const [addOpen,        setAddOpen]        = useState(false)
  const [addBacklogOpen, setAddBacklogOpen] = useState(false)
  const [filtersOpen,    setFiltersOpen]    = useState(false)
  const [notFinishedOpen, setNotFinishedOpen] = useState(true)
  const [recurringOpen,  setRecurringOpen]  = useState(true)
  const [onetimeOpen,    setOnetimeOpen]    = useState(true)
  const [backlogOpen,    setBacklogOpen]    = useState(true)

  useEffect(() => { ensureInstances([selectedDate]) }, [selectedDate])

  const overdueInstances = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (selectedDate !== today) return []
    return instances
      .filter(i => i.date < selectedDate && (i.status === 'pending' || i.status === 'in-progress'))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [instances, selectedDate])

  const backlogInstances = useMemo(() => {
    let list = instances.filter(i => i.date === 'backlog')
    if (ui.categoryFilter.length > 0) list = list.filter(i => ui.categoryFilter.includes(i.categoryId))
    if (ui.priorityFilter.length > 0) list = list.filter(i => ui.priorityFilter.includes(i.priority))
    const po: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return list.sort((a, b) => po[a.priority] - po[b.priority])
  }, [instances, ui.categoryFilter, ui.priorityFilter])

  const dayInstances = useMemo(() => {
    let list = instances.filter(i => i.date === selectedDate)
    if (ui.categoryFilter.length > 0) list = list.filter(i => ui.categoryFilter.includes(i.categoryId))
    if (ui.statusFilter.length > 0)   list = list.filter(i => ui.statusFilter.includes(i.status))
    if (ui.priorityFilter.length > 0) list = list.filter(i => ui.priorityFilter.includes(i.priority))
    const so: Record<Status, number>   = { pending: 0, 'in-progress': 1, completed: 2 }
    const po: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
    return list.sort((a, b) => {
      const sd = so[a.status] - so[b.status]
      return sd !== 0 ? sd : po[a.priority] - po[b.priority]
    })
  }, [instances, selectedDate, ui.categoryFilter, ui.statusFilter, ui.priorityFilter])

  const recurringTasks = dayInstances.filter(i => Boolean(i.templateId))
  const onetimeTasks   = dayInstances.filter(i => !i.templateId)

  const total     = instances.filter(i => i.date === selectedDate).length
  const completed = instances.filter(i => i.date === selectedDate && i.status === 'completed').length
  const pending   = instances.filter(i => i.date === selectedDate && i.status === 'pending').length
  const progress  = total === 0 ? 0 : Math.round((completed / total) * 100)
  const todayDate = isToday(fromDateString(selectedDate))
  const dateLabel = formatDisplay(selectedDate, lang === 'zh' ? 'M月d日 EEEE' : 'EEEE, MMMM d')

  const hasFilters = ui.categoryFilter.length > 0 || ui.statusFilter.length > 0 || ui.priorityFilter.length > 0

  const STATUSES: Status[]   = ['pending', 'in-progress', 'completed']
  const PRIORITIES: Priority[] = ['high', 'medium', 'low']

  return (
    <div className="flex flex-col gap-4">
      <StorageBanner />

      {/* ── Row 1: Date card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 flex items-center gap-6">
        {/* Date text */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-xs font-bold uppercase tracking-widest mb-0.5',
            todayDate ? 'text-indigo-500' : 'text-slate-400')}>
            {todayDate ? t('today') : formatDisplay(selectedDate, lang === 'zh' ? 'yyyy年' : 'yyyy')}
          </p>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight truncate">{dateLabel}</h1>
        </div>

        {/* Progress ring */}
        {total > 0 && (
          <div className="flex items-center gap-5 shrink-0">
            {/* Mini stats */}
            <div className="hidden sm:flex flex-col gap-1">
              <Stat icon={<ClipboardList size={13} />} value={total}     label={t('total')}     color="text-slate-500" />
              <Stat icon={<Circle size={13} />}        value={pending}   label={t('pending')}   color="text-amber-500" />
              <Stat icon={<CheckCircle2 size={13} />}  value={completed} label={t('completed')} color="text-emerald-500" />
              {overdueInstances.length > 0 && (
                <Stat icon={<AlertCircle size={13} />} value={overdueInstances.length} label={t('notFinished')} color="text-rose-500" />
              )}
            </div>
            {/* Ring */}
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle cx="32" cy="32" r="26" fill="none"
                  stroke={progress === 100 ? '#10b981' : '#6366f1'}
                  strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - progress / 100)}`}
                  className="transition-all duration-500"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700">
                {progress}%
              </span>
            </div>
          </div>
        )}

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen(v => !v)}
          className={cn(
            'shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
            filtersOpen || hasFilters
              ? 'bg-indigo-600 text-white border-indigo-600'
              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
          )}
        >
          <Filter size={13} />
          {t('filters')}
          {hasFilters && <span className="bg-white/30 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
            {ui.categoryFilter.length + ui.statusFilter.length + ui.priorityFilter.length}
          </span>}
        </button>
      </div>

      {/* ── Filter row (collapsible) ─────────────────────────────────────── */}
      {filtersOpen && (
        <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 flex flex-wrap gap-x-6 gap-y-3 animate-slide-in">
          {/* Status */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('status')}</p>
            <div className="flex gap-1.5">
              {STATUSES.map(s => (
                <FilterChip
                  key={s} label={t(s as any)}
                  active={ui.statusFilter.includes(s)}
                  onClick={() => setUI({ statusFilter: ui.statusFilter.includes(s) ? ui.statusFilter.filter(x => x !== s) : [...ui.statusFilter, s] })}
                  activeClass={{ pending: 'bg-amber-100 text-amber-700 border-amber-300', 'in-progress': 'bg-blue-100 text-blue-700 border-blue-300', completed: 'bg-emerald-100 text-emerald-700 border-emerald-300' }[s]}
                />
              ))}
            </div>
          </div>
          {/* Priority */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('priority')}</p>
            <div className="flex gap-1.5">
              {PRIORITIES.map(p => (
                <FilterChip
                  key={p} label={t(p)}
                  active={ui.priorityFilter.includes(p)}
                  onClick={() => setUI({ priorityFilter: ui.priorityFilter.includes(p) ? ui.priorityFilter.filter(x => x !== p) : [...ui.priorityFilter, p] })}
                  activeClass={{ high: 'bg-red-100 text-red-700 border-red-300', medium: 'bg-orange-100 text-orange-700 border-orange-300', low: 'bg-slate-100 text-slate-600 border-slate-300' }[p]}
                />
              ))}
            </div>
          </div>
          {/* Category */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{t('category')}</p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(c => (
                <FilterChip
                  key={c.id} label={c.isCustom ? c.name : t(c.name as any)}
                  active={ui.categoryFilter.includes(c.id)}
                  onClick={() => setUI({ categoryFilter: ui.categoryFilter.includes(c.id) ? ui.categoryFilter.filter(x => x !== c.id) : [...ui.categoryFilter, c.id] })}
                  activeClass={`bg-${c.color}-100 text-${c.color}-700 border-${c.color}-300`}
                />
              ))}
            </div>
          </div>
          {hasFilters && (
            <button onClick={() => setUI({ categoryFilter: [], statusFilter: [], priorityFilter: [] })}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 self-end mb-0.5">
              <X size={12} />{t('clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* ── Not Finished banner ─────────────────────────────────────────── */}
      {todayDate && overdueInstances.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 overflow-hidden">
          <button onClick={() => setNotFinishedOpen(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-100/50 transition-colors">
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

      {/* ── Bento grid: Recurring | One-time + Goals ────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">

        {/* LEFT (wider): Recurring tasks */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <TaskSection
            icon={<RefreshCw size={14} />}
            label={lang === 'zh' ? '重複任務' : 'Recurring'}
            count={recurringTasks.length}
            completedCount={recurringTasks.filter(i => i.status === 'completed').length}
            open={recurringOpen}
            onToggle={() => setRecurringOpen(v => !v)}
            onAdd={() => setAddOpen(true)}
            accentBorder="border-indigo-200"
            accentBg="bg-indigo-50/40"
            headerColor="text-indigo-700"
            badgeClass="bg-indigo-100 text-indigo-600"
            progressColor="#6366f1"
            emptyLabel={dayInstances.length === 0 && recurringTasks.length === 0
              ? (ui.categoryFilter.length > 0 || ui.statusFilter.length > 0 || ui.priorityFilter.length > 0
                ? t('noTasksFilter') : t('noTasksDay'))
              : undefined}
            onAddEmpty={() => setAddOpen(true)}
          >
            {recurringTasks.length > 0 && <StatusGroups tasks={recurringTasks} t={t} />}
          </TaskSection>

          {/* One-time tasks (stacked below recurring on left column) */}
          <TaskSection
            icon={<Sparkles size={14} />}
            label={lang === 'zh' ? '一次性任務' : 'One-time'}
            count={onetimeTasks.length}
            completedCount={onetimeTasks.filter(i => i.status === 'completed').length}
            open={onetimeOpen}
            onToggle={() => setOnetimeOpen(v => !v)}
            onAdd={() => setAddOpen(true)}
            accentBorder="border-slate-200"
            accentBg="bg-slate-50/40"
            headerColor="text-slate-700"
            badgeClass="bg-slate-100 text-slate-600"
            progressColor="#94a3b8"
          >
            {onetimeTasks.length > 0 && <StatusGroups tasks={onetimeTasks} t={t} />}
          </TaskSection>
        </div>

        {/* RIGHT (narrower): Goals / Someday */}
        <div className="lg:col-span-2 lg:sticky lg:top-0">
          <div className="rounded-2xl border border-violet-200 bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-violet-600">
              <button onClick={() => setBacklogOpen(v => !v)} className="flex items-center gap-2 flex-1">
                <Target size={14} className="text-violet-200" />
                <span className="text-sm font-bold text-white">{t('backlog')}</span>
                <span className="bg-white/20 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {backlogInstances.length}
                </span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAddBacklogOpen(true)}
                  className="flex items-center gap-1 text-xs text-violet-100 hover:text-white font-semibold transition-colors bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg"
                >
                  <Plus size={12} /> {t('addBacklog')}
                </button>
                <button onClick={() => setBacklogOpen(v => !v)}>
                  <ChevronDown size={15} className={cn('text-violet-300 transition-transform', backlogOpen && 'rotate-180')} />
                </button>
              </div>
            </div>

            {/* Goals list */}
            {backlogOpen && (
              <div className="p-3 flex flex-col gap-2 animate-slide-in">
                {backlogInstances.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center mx-auto mb-2">
                      <Target size={18} className="text-violet-300" />
                    </div>
                    <p className="text-xs text-slate-400">{t('backlogEmpty')}</p>
                    <button
                      onClick={() => setAddBacklogOpen(true)}
                      className="mt-3 text-xs text-violet-600 hover:text-violet-700 font-semibold transition-colors"
                    >
                      + {t('addBacklog')}
                    </button>
                  </div>
                ) : (
                  backlogInstances.map(i => <TaskCard key={i.id} instance={i} />)
                )}
              </div>
            )}
          </div>
        </div>
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

      <Modal open={addBacklogOpen} onClose={() => setAddBacklogOpen(false)} title={t('addBacklog')}>
        <TaskForm
          isBacklog
          onSave={data => { addInstance(data); setAddBacklogOpen(false) }}
          onCancel={() => setAddBacklogOpen(false)}
        />
      </Modal>
    </div>
  )
}

/* ── TaskSection ─────────────────────────────────────────────────────────── */
interface TaskSectionProps {
  icon: React.ReactNode
  label: string
  count: number
  completedCount: number
  open: boolean
  onToggle: () => void
  onAdd: () => void
  accentBorder: string
  accentBg: string
  headerColor: string
  badgeClass: string
  progressColor: string
  children?: React.ReactNode
  emptyLabel?: string
  onAddEmpty?: () => void
}

function TaskSection({ icon, label, count, completedCount, open, onToggle, onAdd, accentBorder, accentBg, headerColor, badgeClass, progressColor, children, emptyLabel, onAddEmpty }: TaskSectionProps) {
  const pct = count === 0 ? 0 : Math.round((completedCount / count) * 100)
  return (
    <div className={cn('rounded-2xl border overflow-hidden shadow-sm', accentBorder, accentBg)}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/60">
        <button onClick={onToggle} className="flex items-center gap-2 flex-1 min-w-0">
          <span className={headerColor}>{icon}</span>
          <span className={cn('text-sm font-bold', headerColor)}>{label}</span>
          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded-full', badgeClass)}>{count}</span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {count > 0 && (
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-white/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: progressColor }} />
              </div>
              <span className="text-xs text-slate-400">{completedCount}/{count}</span>
            </div>
          )}
          <button
            onClick={onAdd}
            className={cn('p-1.5 rounded-lg hover:bg-white/60 transition-colors', headerColor)}
            title="Add task"
          >
            <Plus size={14} />
          </button>
          <button onClick={onToggle}>
            <ChevronDown size={15} className={cn(headerColor, 'opacity-60 transition-transform', open && 'rotate-180')} />
          </button>
        </div>
      </div>

      {/* Body */}
      {open && (
        <div className="p-4 flex flex-col gap-3 animate-slide-in">
          {emptyLabel ? (
            <div className="text-center py-6">
              <div className="w-10 h-10 rounded-full bg-white/70 flex items-center justify-center mx-auto mb-2">
                <ClipboardList size={18} className="text-slate-300" />
              </div>
              <p className="text-xs text-slate-400">{emptyLabel}</p>
              {onAddEmpty && (
                <button onClick={onAddEmpty} className="mt-2 text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                  + Add task
                </button>
              )}
            </div>
          ) : children}
        </div>
      )}
    </div>
  )
}

/* ── FilterChip ──────────────────────────────────────────────────────────── */
function FilterChip({ label, active, onClick, activeClass }: { label: string; active: boolean; onClick: () => void; activeClass?: string }) {
  return (
    <button onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all',
        active ? activeClass : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
      )}>
      {label}
    </button>
  )
}

/* ── Status sub-groups ───────────────────────────────────────────────────── */
function StatusGroups({ tasks, t }: { tasks: TaskInstance[]; t: (k: any) => string }) {
  const pending    = tasks.filter(i => i.status === 'pending')
  const inProgress = tasks.filter(i => i.status === 'in-progress')
  const done       = tasks.filter(i => i.status === 'completed')
  return (
    <>
      {pending.length > 0    && <TaskGroup label={t('pending')}     tasks={pending}    accent="amber" />}
      {inProgress.length > 0 && <TaskGroup label={t('in-progress')} tasks={inProgress} accent="blue" />}
      {done.length > 0       && <TaskGroup label={t('completed')}   tasks={done}       accent="emerald" />}
    </>
  )
}

function TaskGroup({ label, tasks, accent }: { label: string; tasks: TaskInstance[]; accent: string }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-xs font-bold uppercase tracking-wide text-${accent}-600`}>{label}</span>
        <span className={`text-xs font-semibold text-${accent}-400`}>{tasks.length}</span>
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
