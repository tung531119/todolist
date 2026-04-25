import { useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { TemplateCard } from '../templates/TemplateCard'
import { TemplateForm } from '../templates/TemplateForm'
import { Modal } from '../common/Modal'

export function TemplatesView() {
  const { t } = useLang()
  const templates = useStore(s => s.templates)
  const addTemplate = useStore(s => s.addTemplate)
  const [addOpen, setAddOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active = templates.filter(t => !t.archived)
  const archived = templates.filter(t => t.archived)

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
            <RefreshCw size={16} className="text-indigo-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">{t('templatesTitle')}</h1>
            <p className="text-xs text-slate-500">{t('templatesDesc')}</p>
          </div>
        </div>
      </div>

      {/* Active templates */}
      {active.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <RefreshCw size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">{t('noTemplates')}</p>
          <p className="text-xs text-slate-400 mb-4">{t('addFirstTemplate')}</p>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Plus size={14} />
            {t('addTemplate')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {active.map(tmpl => <TemplateCard key={tmpl.id} template={tmpl} />)}
        </div>
      )}

      {/* Archived section */}
      {archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived(v => !v)}
            className="text-xs text-slate-400 hover:text-slate-600 transition-colors mb-2"
          >
            {t('showArchived')} ({archived.length}) {showArchived ? '▲' : '▼'}
          </button>
          {showArchived && (
            <div className="flex flex-col gap-2">
              {archived.map(tmpl => <TemplateCard key={tmpl.id} template={tmpl} />)}
            </div>
          )}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setAddOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title={t('addTemplate')}
      >
        <Plus size={22} />
      </button>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('addTemplate')}>
        <TemplateForm
          onSave={data => { addTemplate(data); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </div>
  )
}
