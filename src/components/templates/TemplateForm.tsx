import { useState } from 'react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { TaskTemplate, Priority, RecurrenceRule, RecurrenceType } from '../../types'
import { cn } from '../../utils/cn'

const DOW_LABELS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

interface Props {
  initial?: TaskTemplate
  onSave: (data: Omit<TaskTemplate, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void
  onCancel: () => void
}

export function TemplateForm({ initial, onSave, onCancel }: Props) {
  const { t } = useLang()
  const categories = useStore(s => s.categories)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? 'work')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [recType, setRecType] = useState<RecurrenceType>(initial?.recurrence.type ?? 'daily')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(initial?.recurrence.daysOfWeek ?? [1, 2, 3, 4, 5])
  const [dayOfMonth, setDayOfMonth] = useState<number>(initial?.recurrence.dayOfMonth ?? 1)
  const [endDate, setEndDate] = useState(initial?.recurrence.endDate ?? '')

  function toggleDow(d: number) {
    setDaysOfWeek(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort())
  }

  function buildRecurrence(): RecurrenceRule {
    const base: RecurrenceRule = { type: recType }
    if (recType === 'weekly') base.daysOfWeek = daysOfWeek
    if (recType === 'monthly') base.dayOfMonth = dayOfMonth
    if (endDate) base.endDate = endDate
    return base
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      recurrence: buildRecurrence(),
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
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
        />
      </div>

      {/* Category + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('category')}</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>
                {c.isCustom ? c.name : t(c.name as any)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('priority')}</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as Priority)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="low">{t('low')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="high">{t('high')}</option>
          </select>
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">{t('recurrence')}</label>
        <div className="flex gap-2 flex-wrap">
          {(['none', 'daily', 'weekly', 'monthly'] as RecurrenceType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setRecType(type)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                recType === type
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              )}
            >
              {t(type)}
            </button>
          ))}
        </div>

        {/* Weekly: day picker */}
        {recType === 'weekly' && (
          <div className="mt-3">
            <p className="text-xs text-slate-400 mb-2">{t('daysOfWeek')}</p>
            <div className="flex gap-1.5">
              {DOW_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDow(i)}
                  className={cn(
                    'w-9 h-9 rounded-lg text-xs font-medium border transition-all',
                    daysOfWeek.includes(i)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  )}
                >
                  {t(label as any)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly: day of month */}
        {recType === 'monthly' && (
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">{t('dayOfMonth')}</label>
            <input
              type="number"
              min={1} max={28}
              value={dayOfMonth}
              onChange={e => setDayOfMonth(Number(e.target.value))}
              className="w-24 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        )}

        {/* End date */}
        {recType !== 'none' && (
          <div className="mt-3">
            <label className="block text-xs text-slate-400 mb-1">{t('endDate')} ({t('optional')})</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors">
          {t('cancel')}
        </button>
        <button type="submit"
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
          {t('save')}
        </button>
      </div>
    </form>
  )
}
