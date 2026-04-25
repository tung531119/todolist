import { useState } from 'react'
import { Plus, Trash2, Globe, Database } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { getStorageUsage, formatBytes } from '../../utils/storage'
import { ConfirmDialog } from '../common/Modal'
import { cn } from '../../utils/cn'

const COLORS = ['indigo', 'violet', 'emerald', 'amber', 'sky', 'rose', 'teal', 'pink'] as const
const colorPreview: Record<string, string> = {
  indigo:  'bg-indigo-500',
  violet:  'bg-violet-500',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  sky:     'bg-sky-500',
  rose:    'bg-rose-500',
  teal:    'bg-teal-500',
  pink:    'bg-pink-500',
}

export function SettingsView() {
  const { t, lang } = useLang()
  const setLang = useStore(s => s.setLang)
  const categories = useStore(s => s.categories)
  const addCategory = useStore(s => s.addCategory)
  const deleteCategory = useStore(s => s.deleteCategory)
  const clearOldCompleted = useStore(s => s.clearOldCompleted)

  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState<string>('indigo')
  const [confirmClear, setConfirmClear] = useState(false)
  const [cleared, setCleared] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const usage = getStorageUsage()

  function handleAddCategory() {
    if (!catName.trim()) return
    addCategory(catName.trim(), catColor)
    setCatName('')
    setCatColor('indigo')
  }

  function handleClear() {
    const n = clearOldCompleted()
    setCleared(n)
    setConfirmClear(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      {/* Language */}
      <Section icon={<Globe size={16} />} title={t('language')}>
        <div className="flex gap-2">
          <LangButton active={lang === 'en'} onClick={() => setLang('en')} label={t('english')} />
          <LangButton active={lang === 'zh'} onClick={() => setLang('zh')} label={t('chinese')} />
        </div>
      </Section>

      {/* Storage */}
      <Section icon={<Database size={16} />} title={t('storageUsage')}>
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{formatBytes(usage.bytes)} used</span>
            <span>{Math.round(usage.ratio * 100)}% of ~5 MB</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all',
                usage.level === 'critical' ? 'bg-red-500'
                : usage.level === 'warn' ? 'bg-amber-400'
                : 'bg-indigo-400'
              )}
              style={{ width: `${Math.min(usage.ratio * 100, 100)}%` }}
            />
          </div>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
        >
          <Trash2 size={14} />
          {t('clearOldTasks')}
        </button>
        {cleared !== null && (
          <p className="text-xs text-emerald-600 mt-2">{t('cleared')}: {cleared} tasks removed.</p>
        )}
      </Section>

      {/* Categories */}
      <Section icon={<span className="text-sm">🏷</span>} title={t('manageCategories')}>
        <div className="flex flex-col gap-2 mb-4">
          {categories.map(c => (
            <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
              <span className={cn('w-3 h-3 rounded-full shrink-0', colorPreview[c.color] ?? 'bg-slate-400')} />
              <span className="flex-1 text-sm text-slate-700">
                {c.isCustom ? c.name : t(c.name as any)}
              </span>
              {c.isCustom && (
                <button
                  onClick={() => setDeleteConfirm(c.id)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add category */}
        <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-medium text-slate-500">{t('newCategory')}</p>
          <input
            value={catName}
            onChange={e => setCatName(e.target.value)}
            placeholder={t('categoryName')}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
          />
          <div>
            <p className="text-xs text-slate-400 mb-1.5">{t('categoryColor')}</p>
            <div className="flex gap-1.5 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setCatColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full transition-all',
                    colorPreview[c],
                    catColor === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-105'
                  )}
                />
              ))}
            </div>
          </div>
          <button
            onClick={handleAddCategory}
            disabled={!catName.trim()}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
          >
            <Plus size={14} />
            {t('addCategory')}
          </button>
        </div>
      </Section>

      {/* Confirm clear */}
      <ConfirmDialog
        open={confirmClear}
        message={t('confirmClearTasks')}
        confirmLabel={t('clearOldTasks')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={handleClear}
        onCancel={() => setConfirmClear(false)}
      />

      {/* Confirm delete category */}
      <ConfirmDialog
        open={deleteConfirm !== null}
        message={t('confirmDelete')}
        confirmLabel={t('delete')}
        cancelLabel={t('cancel')}
        danger
        onConfirm={() => { if (deleteConfirm) { deleteCategory(deleteConfirm); setDeleteConfirm(null) } }}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function LangButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-2 text-sm rounded-lg font-medium border transition-all',
        active
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  )
}
