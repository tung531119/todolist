import { useState } from 'react'
import { Check, Circle, Clock, MoreHorizontal, Pencil, Trash2, RefreshCw, ChevronDown } from 'lucide-react'
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

const statusStyles: Record<Status, { badge: string; dot: string; icon: string }> = {
  pending:       { badge: 'bg-amber-100 text-amber-700 border-amber-200',   dot: 'bg-amber-400',   icon: 'text-amber-500' },
  'in-progress': { badge: 'bg-blue-100 text-blue-700 border-blue-200',     dot: 'bg-blue-400',    icon: 'text-blue-500' },
  completed:     { badge: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400', icon: 'text-emerald-500' },
}

const circleStyles: Record<Status, string> = {
  pending:       'border-2 border-slate-300 hover:border-amber-400 text-transparent',
  'in-progress': 'bg-blue-100 text-blue-600 hover:bg-blue-200',
  completed:     'bg-emerald-500 text-white',
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

  const category = categories.find(c => c.id === instance.categoryId)
  const isCompleted = instance.status === 'completed'
  const style = statusStyles[instance.status]

  const StatusIcon = instance.status === 'completed' ? Check
    : instance.status === 'in-progress' ? Clock
    : Circle

  return (
    <>
      <div className={cn(
        'group relative bg-white rounded-xl border transition-all duration-200',
        isCompleted
          ? 'border-slate-100 opacity-75'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      )}>
        <div className="flex items-start gap-3 p-4">

          {/* Circle status indicator (quick complete toggle) */}
          <button
            onClick={() => setStatus(instance.id, isCompleted ? 'pending' : instance.status === 'pending' ? 'in-progress' : 'completed')}
            className={cn(
              'mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all',
              circleStyles[instance.status]
            )}
            title={t('status')}
          >
            <StatusIcon size={12} strokeWidth={instance.status === 'pending' ? 0 : 2.5} />
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn(
                'text-sm font-medium text-slate-900 leading-snug',
                isCompleted && 'line-through text-slate-400'
              )}>
                {instance.title}
                {instance.templateId && (
                  <RefreshCw size={10} className="inline ml-1.5 text-slate-400" />
                )}
              </p>

              {/* Action menu */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px] animate-slide-in">
                    <MenuButton icon={<Pencil size={13} />} label={t('editTask')} onClick={() => { setEditOpen(true); setMenuOpen(false) }} />
                    <MenuButton icon={<Trash2 size={13} />} label={t('deleteTask')} onClick={() => { setConfirmDelete(true); setMenuOpen(false) }} danger />
                  </div>
                )}
              </div>
            </div>

            {instance.description && (
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{instance.description}</p>
            )}

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">

              {/* ── Clickable status badge with dropdown ── */}
              <div className="relative">
                <button
                  onClick={() => setStatusMenuOpen(v => !v)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer hover:opacity-80',
                    style.badge
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', style.dot)} />
                  {t(instance.status as any)}
                  <ChevronDown size={10} className={cn('transition-transform', statusMenuOpen && 'rotate-180')} />
                </button>

                {statusMenuOpen && (
                  <div className="absolute left-0 top-7 z-20 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[140px] animate-slide-in">
                    {STATUS_LIST.map(s => {
                      const st = statusStyles[s]
                      const isActive = s === instance.status
                      return (
                        <button
                          key={s}
                          onClick={() => { setStatus(instance.id, s); setStatusMenuOpen(false) }}
                          className={cn(
                            'w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors text-left',
                            isActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'
                          )}
                        >
                          <span className={cn('w-2 h-2 rounded-full shrink-0', st.dot)} />
                          <span className="text-slate-700">{t(s as any)}</span>
                          {isActive && <span className="ml-auto text-slate-400">✓</span>}
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
            </div>

            {/* Notes (collapsible) */}
            {instance.notes && (
              <div className="mt-2">
                <button
                  onClick={() => setNotesOpen(v => !v)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown size={12} className={cn('transition-transform', notesOpen && 'rotate-180')} />
                  Notes
                </button>
                {notesOpen && (
                  <p className="mt-1 text-xs text-slate-600 bg-slate-50 rounded-lg p-2 border border-slate-100 leading-relaxed">
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

      {/* Outside click handlers */}
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
        'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
      )}
    >
      {icon}
      {label}
    </button>
  )
}
