import { useState } from 'react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { TaskInstance, Priority, Status } from '../../types'
import { todayString } from '../../utils/date'

interface Props {
  initial?: Partial<TaskInstance>
  onSave: (data: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  defaultDate?: string
}

export function TaskForm({ initial, onSave, onCancel, defaultDate }: Props) {
  const { t } = useLang()
  const categories = useStore(s => s.categories)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? 'work')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'medium')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'pending')
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? todayString())
  const [notes, setNotes] = useState(initial?.notes ?? '')

  const canSave = title.trim().length > 0

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSave) return
    onSave({
      templateId: initial?.templateId ?? null,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      status,
      date,
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

      {/* Row: Category + Priority */}
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

      {/* Row: Status + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('status')}</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="pending">{t('pending')}</option>
            <option value="in-progress">{t('in-progress')}</option>
            <option value="completed">{t('completed')}</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">{t('date')}</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          {t('notes')} <span className="text-slate-400">({t('optional')})</span>
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-white"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          disabled={!canSave}
          className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
        >
          {t('save')}
        </button>
      </div>
    </form>
  )
}
