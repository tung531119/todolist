import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { TaskInstance, Priority, Status, RecurrenceType } from '../../types'
import { todayString } from '../../utils/date'
import { cn } from '../../utils/cn'

interface Props {
  initial?: Partial<TaskInstance>
  onSave: (data: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  defaultDate?: string
  /** If true, task is created as a backlog item (no date) */
  isBacklog?: boolean
}

const DOW_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export function TaskForm({ initial, onSave, onCancel, defaultDate, isBacklog }: Props) {
  const { t } = useLang()
  const categories = useStore(s => s.categories)
  const templates = useStore(s => s.templates)
  const addTemplate = useStore(s => s.addTemplate)
  const updateTemplate = useStore(s => s.updateTemplate)

  // Task fields
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? 'work')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'pending')
  const initialIsBacklog = isBacklog || initial?.date === 'backlog'
  const [noDate, setNoDate] = useState(initialIsBacklog)
  const [date, setDate] = useState(
    (initial?.date && initial.date !== 'backlog') ? initial.date : (defaultDate ?? todayString())
  )
  const [notes, setNotes] = useState(initial?.notes ?? '')

  // Recurrence — pre-fill from existing template if linked
  const linkedTemplate = initial?.templateId
    ? templates.find(t => t.id === initial.templateId)
    : null
  const [recType, setRecType] = useState<RecurrenceType>(linkedTemplate?.recurrence.type ?? 'none')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(linkedTemplate?.recurrence.daysOfWeek ?? [1, 2, 3, 4, 5])
  const [dayOfMonth, setDayOfMonth] = useState<number>(linkedTemplate?.recurrence.dayOfMonth ?? 1)
  const [endDate, setEndDate] = useState(linkedTemplate?.recurrence.endDate ?? '')

  function toggleDow(d: number) {
    setDaysOfWeek(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    let templateId = initial?.templateId ?? null

    if (recType !== 'none') {
      const recurrence = {
        type: recType,
        ...(recType === 'weekly' && { daysOfWeek }),
        ...(recType === 'monthly' && { dayOfMonth }),
        ...(endDate && { endDate }),
      }
      if (linkedTemplate) {
        // Update existing template
        updateTemplate(linkedTemplate.id, {
          title: title.trim(),
          description: description.trim(),
          categoryId,
          priority,
          recurrence,
        })
      } else {
        // Create a new template — we need its id after creation
        // Zustand addTemplate doesn't return id, so we capture via snapshot
        const before = useStore.getState().templates.map(t => t.id)
        addTemplate({ title: title.trim(), description: description.trim(), categoryId, priority, recurrence })
        const after = useStore.getState().templates
        const newTemplate = after.find(t => !before.includes(t.id))
        if (newTemplate) templateId = newTemplate.id
      }
    } else if (linkedTemplate && recType === 'none') {
      // User removed recurrence — unlink (keep template in place but detach this instance)
      templateId = null
    }

    onSave({
      templateId,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      status,
      date: noDate ? 'backlog' : date,
      completedAt: status === 'completed' ? (initial?.completedAt ?? new Date().toISOString()) : null,
      notes: notes.trim(),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t('title')}</label>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={t('title') + '…'}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent bg-white"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          {t('description')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none bg-white"
        />
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('category')}</label>
          <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white">
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.isCustom ? c.name : t(c.name as any)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('priority')}</label>
          <select value={priority} onChange={e => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white">
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
        </div>
      </div>

      {/* Status + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('status')}</label>
          <select value={status} onChange={e => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white">
            <option value="pending">{t('pending')}</option>
            <option value="in-progress">{t('in-progress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('date')}</label>
          {noDate ? (
            <button type="button" onClick={() => setNoDate(false)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-amber-200 bg-amber-50 text-amber-600 text-left hover:bg-amber-100 transition-colors">
              {t('backlog')} ↗
            </button>
          ) : (
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white" />
          )}
        </div>
      </div>

      {/* No-date toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input type="checkbox" checked={noDate} onChange={e => setNoDate(e.target.checked)}
          className="w-4 h-4 rounded accent-amber-500" />
        <span className="text-xs text-slate-500">{t('backlogDesc')}</span>
      </label>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          {t('notes')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent resize-none bg-white" />
      </div>

      {/* ── Recurrence section ── */}
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
        <div className="flex items-center gap-2 mb-3">
          <RefreshCw size={13} className="text-indigo-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">{t('recurrence')}</span>
          {linkedTemplate && recType !== 'none' && (
            <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
              {t('activeTemplate')}
            </span>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map(type => (
            <button key={type} type="button" onClick={() => setRecType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                recType === type
                  ? 'bg-zinc-900 text-white border-zinc-900'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              )}>
              {t(type)}
            </button>
          ))}
        </div>

        {/* Weekly: day picker */}
        {recType === 'weekly' && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-2">{t('daysOfWeek')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {DOW_LABELS.map((label, i) => (
                <button key={i} type="button" onClick={() => toggleDow(i)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-xs font-medium border transition-all',
                    daysOfWeek.includes(i)
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  )}>
                  {t(label as any)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly */}
        {recType === 'monthly' && (
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">{t('dayOfMonth')}</label>
            <input type="number" min={1} max={28} value={dayOfMonth}
              onChange={e => setDayOfMonth(Number(e.target.value))}
              className="w-24 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white" />
          </div>
        )}

        {/* End date */}
        {recType !== 'none' && (
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">{t('endDate')} ({t('optional')})</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 bg-white" />
          </div>
        )}

        {recType !== 'none' && !linkedTemplate && (
          <p className="mt-2 text-xs text-indigo-500">
            A recurring template will be created and linked to this task.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
          {t('cancel')}
        </button>
        <button type="submit" disabled={!title.trim()}
          className="px-4 py-2 text-sm rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors disabled:opacity-50">
          {t('save')}
        </button>
      </div>
    </form>
  )
}
