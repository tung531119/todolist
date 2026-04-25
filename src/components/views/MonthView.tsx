import { useEffect, useMemo } from 'react'
import {
  getMonthDays,
  formatDisplay,
  todayString,
  fromDateString,
  startOfWeek,
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  toDateString,
} from '../../utils/date'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { cn } from '../../utils/cn'
import type { TaskInstance } from '../../types'
import { StorageBanner } from '../common/StorageBanner'

export function MonthView() {
  const { t, lang } = useLang()
  const selectedDate = useStore(s => s.ui.selectedDate)
  const setSelectedDate = useStore(s => s.setSelectedDate)
  const setViewMode = useStore(s => s.setViewMode)
  const instances = useStore(s => s.instances)
  const ui = useStore(s => s.ui)
  const ensureInstances = useStore(s => s.ensureInstances)

  const today = todayString()
  const monthDays = useMemo(() => getMonthDays(selectedDate), [selectedDate])

  // Build calendar grid (Mon–Sun, padding)
  const calendarCells = useMemo(() => {
    const d = fromDateString(selectedDate)
    const monthStart = startOfMonth(d)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const gridEnd = (() => {
      const end = endOfMonth(d)
      const eow = new Date(end)
      while (eow.getDay() !== 0) eow.setDate(eow.getDate() + 1)
      return eow
    })()
    return eachDayOfInterval({ start: gridStart, end: gridEnd }).map(toDateString)
  }, [selectedDate])

  useEffect(() => {
    ensureInstances(monthDays)
  }, [monthDays.join(',')])

  function getTasksForDay(date: string): TaskInstance[] {
    let list = instances.filter(i => i.date === date)
    if (ui.categoryFilter.length > 0) list = list.filter(i => ui.categoryFilter.includes(i.categoryId))
    if (ui.statusFilter.length > 0) list = list.filter(i => ui.statusFilter.includes(i.status))
    if (ui.priorityFilter.length > 0) list = list.filter(i => ui.priorityFilter.includes(i.priority))
    return list
  }

  const currentMonth = formatDisplay(selectedDate, 'yyyy-MM').slice(0, 7)
  const WEEK_HEADERS = lang === 'zh'
    ? ['一', '二', '三', '四', '五', '六', '日']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="flex flex-col gap-4">
      <StorageBanner />

      {/* Month header */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{t('month')}</p>
        <h1 className="text-lg font-bold text-slate-900">
          {formatDisplay(selectedDate, lang === 'zh' ? 'yyyy年M月' : 'MMMM yyyy')}
        </h1>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {/* Day-of-week header */}
        <div className="grid grid-cols-7 border-b border-slate-100">
          {WEEK_HEADERS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7">
          {calendarCells.map((date, i) => {
            const inCurrentMonth = date.slice(0, 7) === currentMonth
            const tasks = getTasksForDay(date)
            const completed = tasks.filter(t => t.status === 'completed').length
            const isCurrentDay = date === today
            const isSelected = date === selectedDate
            const hasHighPriority = tasks.some(t => t.priority === 'high' && t.status !== 'completed')

            return (
              <button
                key={date}
                onClick={() => { setSelectedDate(date); setViewMode('day') }}
                className={cn(
                  'relative min-h-[80px] p-2 text-left border-b border-r border-slate-100 last:border-r-0 transition-colors',
                  !inCurrentMonth && 'bg-slate-50/50',
                  isSelected && 'bg-indigo-50',
                  inCurrentMonth && !isSelected && 'hover:bg-slate-50',
                  (i + 1) % 7 === 0 && 'border-r-0',
                )}
              >
                {/* Date number */}
                <span className={cn(
                  'inline-flex w-7 h-7 items-center justify-center rounded-full text-sm font-medium mb-1',
                  isCurrentDay
                    ? 'bg-indigo-600 text-white'
                    : isSelected
                    ? 'bg-indigo-100 text-indigo-700'
                    : inCurrentMonth
                    ? 'text-slate-700'
                    : 'text-slate-300'
                )}>
                  {formatDisplay(date, 'd')}
                </span>

                {/* Task indicators */}
                {tasks.length > 0 && (
                  <div className="flex flex-col gap-0.5">
                    {/* Progress dot row */}
                    <div className="flex gap-0.5 flex-wrap">
                      {tasks.slice(0, 5).map(task => (
                        <span key={task.id} className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          task.status === 'completed' ? 'bg-emerald-400'
                          : task.status === 'in-progress' ? 'bg-blue-400'
                          : task.priority === 'high' ? 'bg-red-400'
                          : 'bg-amber-300'
                        )} />
                      ))}
                      {tasks.length > 5 && <span className="text-slate-400 text-[9px]">+{tasks.length - 5}</span>}
                    </div>
                    <span className="text-[10px] text-slate-400">{completed}/{tasks.length}</span>
                  </div>
                )}

                {hasHighPriority && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">Click a day to view details</p>
    </div>
  )
}
