import { useState } from 'react'
import { Check, Clock, MoreHorizontal, Pencil, Trash2, RefreshCw, ChevronDown } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { TaskInstance, Status } from '../../types'
import { PriorityBadge, CategoryBadge } from '../common/Badge'
import { Modal, ConfirmDialog } from '../common/Modal'
import { TaskForm } from './TaskForm'
import { cn } from '../../utils/cn'

interface Props {
  instance: TaskInstance
}

const STATUS_LIST: Status[] = ['pending', 'in-progress', 'completed']

const statusStyles: Record<Status, { badge: string; dot: string }> = {
  pending:       { badge: 'bg-zinc-100 text-zinc-600 border-zinc-200',      dot: 'bg-zinc-400' },
  'in-progress': { badge: 'bg-blue-50 text-blue-700 border-blue-100',       dot: 'bg-blue-500' },
  completed:     { badge: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
}

const circleStyles: Record<Status, string> = {
  pending:       'border-2 border-zinc-200 hover:border-blue-400 text-transparent',
  'in-progress': 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  completed:     'bg-emerald-500 text-white',
}

const statusIcon: Record<Status, React.ReactNode> = {
  pending:       <Check size={11} strokeWidth={2.5} className="opacity-0" />,
  'in-progress': <Clock size={11} strokeWidth={2.5} />,
  completed:     <Check size={11} strokeWidth={2.5} />,
}

export function TaskCard({ instance }: Props) {
  const { t } = useLang()
  const categories = useStore(s => s.categories)
  const setStatus = useStore(s => s.setStatus)
  const updateInstance = useStore(s => s.updateInstance)
  const deleteInstance = useStore(s => s.deleteInstance)

  const [menuOpen, setMenuOpen] = useState(false)
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [scheduleDate] = useState('')

  const category = categories.find(c => c.id === instance.categoryId)
  const isCompleted = instance.status === 'completed'
  const isRecurring = Boolean(instance.templateId)
  const isBacklog = instance.date === 'backlog'
  const style = statusStyles[instance.status]

  return (
    <>
      <div className={cn(
        'group relative bg-white rounded-xl border transition-all duration-200 overflow-hidden',
        isCompleted
          ? 'border-zinc-100 opacity-60'
          : isRecurring && !isBacklog
          ? 'border-blue-100 hover:border-blue-200 hover:shadow-sm'
          : 'border-zinc-100 hover:border-zinc-200 hover:shadow-sm'
      )}>
        {/* Left accent bar */}
        {isRecurring && !isBacklog && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-xl" />
        )}
        {isBacklog && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-300 rounded-l-xl" />
        )}
        <div className={cn('flex items-start gap-3 p-4', (isRecurring || isBacklog) && 'pl-5')}>

          {/* Circle status indicator */}
          <button
            onClick={() => setStatus(
              instance.id,
              isCompleted ? 'pending' : instance.status === 'pending' ? 'in-progress' : 'completed'
            )}
            className={cn(
              'mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all',
              circleStyles[instance.status]
            )}
            title={t('status')}
          >
            {statusIcon[instance.status]}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                'text-sm font-medium leading-snug',
                isCompleted ? 'line-through text-zinc-400' : 'text-zinc-800'
              )}>
                {instance.title}
              </p>

              {/* Action menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-10 bg-white border border-zinc-100 rounded-xl shadow-xl py-1 min-w-[160px] animate-slide-in">
                    <MenuButton icon={<Pencil size={13} />} label={t('editTask')} onClick={() => { setEditOpen(true); setMenuOpen(false) }} />
                    {isBacklog && (
                      <div className="px-3 py-2 border-t border-zinc-100">
                        <p className="text-[10px] text-zinc-400 mb-1">{t('scheduleTask')}</p>
                        <input
                          type="date"
                          value={scheduleDate}
                          onChange={e => {
                            if (e.target.value) {
                              updateInstance(instance.id, { date: e.target.value })
                              setMenuOpen(false)
                            }
                          }}
                          className="w-full px-2 py-1 text-xs rounded-md border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    )}
                    <MenuButton icon={<Trash2 size={13} />} label={t('deleteTask')} onClick={() => { setConfirmDelete(true); setMenuOpen(false) }} danger />
                  </div>
                )}
              </div>
            </div>

            {instance.description && (
              <p className="text-sm text-zinc-500 mt-1 leading-relaxed">{instance.description}</p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">

              {/* Clickable status badge */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(v => !v)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors cursor-pointer hover:opacity-80',
                    style.badge
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
                  {t(instance.status as any)}
                  <ChevronDown size={10} className={cn('transition-transform', statusMenuOpen && 'rotate-180')} />
                </button>

                {statusMenuOpen && (
                  <div className="absolute left-0 top-8 z-20 bg-white border border-zinc-100 rounded-xl shadow-xl py-1 min-w-[140px] animate-slide-in">
                    {STATUS_LIST.map(s => {
                      const st = statusStyles[s]
                      const isActive = s === instance.status
                      return (
                        <button
                          key={s}
                          onClick={() => { setStatus(instance.id, s); setStatusMenuOpen(false) }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left',
                            isActive ? 'bg-zinc-50 font-semibold' : 'hover:bg-zinc-50'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full shrink-0', st.dot)} />
                          <span className="text-zinc-700">{t(s as any)}</span>
                          {isActive && <span className="ml-auto text-zinc-400">✓</span>}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <PriorityBadge priority={instance.priority} label={t(instance.priority)} />
              {category && (
                <CategoryBadge
                  color={category.color}
                  label={category.isCustom ? category.name : t(category.name as any)}
                />
              )}
              {isRecurring && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-500 border border-blue-100">
                  <RefreshCw size={10} />
                  {t('recurrence')}
                </span>
              )}
            </div>

            {/* Notes (collapsible) */}
            {instance.notes && (
              <div className="mt-2">
                <button
                  onClick={() => setNotesOpen(v => !v)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <ChevronDown size={12} className={cn('transition-transform', notesOpen && 'rotate-180')} />
                  Notes
                </button>
                {notesOpen && (
                  <p className="mt-1 text-xs text-zinc-600 bg-zinc-50 rounded-lg p-2 border border-zinc-100 leading-relaxed">
                    {instance.notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('editTask')}>
        <TaskForm
          initial={instance}
          onSave={data => { updateInstance(instance.id, data); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        message={t('confirmDelete')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={() => { deleteInstance(instance.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />

      {menuOpen && <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(false)} />}
      {statusMenuOpen && <div className="fixed inset-0 z-[15]" onClick={() => setStatusMenuOpen(false)} />}
    </>
  )
}

function MenuButton({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-zinc-50 transition-colors text-left',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
