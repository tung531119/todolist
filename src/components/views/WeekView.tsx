import { useEffect, useMemo } from 'react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import {
  getWeekDays,
  formatDisplay,
  isToday,
  fromDateString,
} from '../../utils/date'
import { cn } from '../../utils/cn'
import type { TaskInstance, Status } from '../../types'
import { StorageBanner } from '../common/StorageBanner'

const statusDot: Record<Status, string> = {
  pending: 'bg-amber-400',
  'in-progress': 'bg-blue-400',
  completed: 'bg-emerald-400',
}

export function WeekView() {
  const { t, lang } = useLang()
  const selectedDate = useStore(s => s.ui.selectedDate)
  const setSelectedDate = useStore(s => s.setSelectedDate)
  const setViewMode = useStore(s => s.setViewMode)
  const instances = useStore(s => s.instances)
  const ui = useStore(s => s.ui)
  const ensureInstances = useStore(s => s.ensureInstances)

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate])

  useEffect(() => {
    ensureInstances(weekDays)
  }, [weekDays.join(',')])

  function getTasksForDay(date: string): TaskInstance[] {
    let list = instances.filter(i => i.date === date)
    if (ui.categoryFilter.length > 0) list = list.filter(i => ui.categoryFilter.includes(i.categoryId))
    if (ui.statusFilter.length > 0) list = list.filter(i => ui.statusFilter.includes(i.status))
    if (ui.priorityFilter.length > 0) list = list.filter(i => ui.priorityFilter.includes(i.priority))
    return list
  }

  return (
    <div className="flex flex-col gap-4">
      <StorageBanner />

      {/* Week label */}
      <div className="bg-white rounded-xl border border-slate-200 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{t('week')}</p>
        <h1 className="text-lg font-bold text-slate-900">
          {formatDisplay(weekDays[0], lang === 'zh' ? 'M月d日' : 'MMM d')} — {formatDisplay(weekDays[6], lang === 'zh' ? 'M月d日, yyyy' : 'MMM d, yyyy')}
        </h1>
      </div>

      {/* Week grid — horizontal scroll on mobile */}
      <div className="overflow-x-auto -mx-1 px-1">
      <div className="grid grid-cols-7 gap-2 min-w-[560px]">
        {weekDays.map(date => {
          const tasks = getTasksForDay(date)
          const completed = tasks.filter(t => t.status === 'completed').length
          const isSelected = date === selectedDate
          const isCurrentDay = isToday(fromDateString(date))

          return (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); setViewMode('day') }}
              className={cn(
                'group flex flex-col gap-2 p-3 rounded-xl border text-left transition-all hover:shadow-sm',
                isSelected
                  ? 'border-indigo-300 bg-indigo-50'
                  : isCurrentDay
                  ? 'border-indigo-200 bg-white'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              {/* Day header */}
              <div className="flex flex-col items-center">
                <span className={cn('text-xs font-medium',
                  isCurrentDay ? 'text-indigo-500' : 'text-slate-400'
                )}>
                  {formatDisplay(date, lang === 'zh' ? 'EEE' : 'EEE')}
                </span>
                <span className={cn(
                  'text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full mt-0.5',
                  isCurrentDay
                    ? 'bg-indigo-600 text-white'
                    : isSelected
                    ? 'text-indigo-600'
                    : 'text-slate-700'
                )}>
                  {formatDisplay(date, 'd')}
                </span>
              </div>

              {/* Task count */}
              {tasks.length > 0 ? (
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{tasks.length}</span>
                    <span className="text-emerald-600">{completed}✓</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', completed === tasks.length && tasks.length > 0 ? 'bg-emerald-400' : 'bg-indigo-400')}
                      style={{ width: `${tasks.length === 0 ? 0 : (completed / tasks.length) * 100}%` }}
                    />
                  </div>
                  {/* Dots for top tasks */}
                  <div className="flex flex-col gap-0.5 mt-1">
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center gap-1 overflow-hidden">
                        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot[task.status])} />
                        <span className="text-xs text-slate-500 truncate leading-tight">{task.title}</span>
                      </div>
                    ))}
                    {tasks.length > 3 && (
                      <span className="text-xs text-slate-400">+{tasks.length - 3} more</span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 text-center">—</p>
              )}
            </button>
          )
        })}
      </div>

      </div>{/* end scroll wrapper */}

      <p className="text-xs text-slate-400 text-center">Click a day to view details</p>
    </div>
  )
}
