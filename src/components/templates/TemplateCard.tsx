import { useState } from 'react'
import { Pencil, Trash2, Archive, ArchiveRestore, MoreHorizontal, RefreshCw } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import type { TaskTemplate } from '../../types'
import { CategoryBadge, PriorityBadge } from '../common/Badge'
import { Modal, ConfirmDialog } from '../common/Modal'
import { TemplateForm } from './TemplateForm'
import { cn } from '../../utils/cn'

interface Props { template: TaskTemplate }

const recurrenceIcon: Record<string, string> = {
  daily: '↻ Daily',
  weekly: '↻ Weekly',
  monthly: '↻ Monthly',
  none: '— Once',
}

export function TemplateCard({ template }: Props) {
  const { t } = useLang()
  const categories = useStore(s => s.categories)
  const updateTemplate = useStore(s => s.updateTemplate)
  const deleteTemplate = useStore(s => s.deleteTemplate)
  const archiveTemplate = useStore(s => s.archiveTemplate)

  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const category = categories.find(c => c.id === template.categoryId)

  return (
    <>
      <div className={cn(
        'group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 hover:shadow-sm transition-all',
        template.archived && 'opacity-60'
      )}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <RefreshCw size={14} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-slate-900">{template.title}</p>
              <div className="relative shrink-0">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-slate-100 text-slate-400 transition-all"
                >
                  <MoreHorizontal size={14} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-7 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 min-w-[150px] animate-slide-in">
                    <MenuBtn icon={<Pencil size={13} />} label={t('editTemplate')} onClick={() => { setEditOpen(true); setMenuOpen(false) }} />
                    <MenuBtn
                      icon={template.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                      label={template.archived ? t('unarchive') : t('archive')}
                      onClick={() => { archiveTemplate(template.id, !template.archived); setMenuOpen(false) }}
                    />
                    <MenuBtn icon={<Trash2 size={13} />} label={t('deleteTemplate')} onClick={() => { setConfirmDelete(true); setMenuOpen(false) }} danger />
                  </div>
                )}
              </div>
            </div>

            {template.description && (
              <p className="text-xs text-slate-500 mt-1">{template.description}</p>
            )}

            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                {recurrenceIcon[template.recurrence.type]}
              </span>
              <PriorityBadge priority={template.priority} label={t(template.priority)} />
              {category && (
                <CategoryBadge color={category.color} label={category.isCustom ? category.name : t(category.name as any)} />
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={t('editTemplate')}>
        <TemplateForm
          initial={template}
          onSave={data => { updateTemplate(template.id, data); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmDelete}
        message={t('confirmDeleteTemplate')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={() => { deleteTemplate(template.id); setConfirmDelete(false) }}
        onCancel={() => setConfirmDelete(false)}
      />

      {menuOpen && <div className="fixed inset-0 z-[5]" onClick={() => setMenuOpen(false)} />}
    </>
  )
}

function MenuBtn({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} className={cn(
      'w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-slate-50 transition-colors text-left',
      danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700'
    )}>
      {icon}{label}
    </button>
  )
}
