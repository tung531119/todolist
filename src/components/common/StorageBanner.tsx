import { AlertTriangle, AlertCircle, X, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getStorageUsage, formatBytes } from '../../utils/storage'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'

export function StorageBanner() {
  const { t } = useLang()
  const clearOldCompleted = useStore(s => s.clearOldCompleted)
  const [usage, setUsage] = useState(getStorageUsage)
  const [dismissed, setDismissed] = useState(false)
  const [cleared, setCleared] = useState<number | null>(null)

  useEffect(() => {
    const id = setInterval(() => setUsage(getStorageUsage()), 10_000)
    return () => clearInterval(id)
  }, [])

  if (usage.level === 'ok' || dismissed) return null

  const isCritical = usage.level === 'critical'

  function handleClear() {
    const n = clearOldCompleted()
    setCleared(n)
    setUsage(getStorageUsage())
  }

  return (
    <div className={`
      flex items-start gap-3 px-4 py-3 text-sm rounded-xl mb-4 border
      ${isCritical
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-amber-50 border-amber-200 text-amber-800'}
    `}>
      {isCritical
        ? <AlertCircle size={16} className="mt-0.5 shrink-0" />
        : <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      }
      <div className="flex-1 min-w-0">
        <p className="font-medium">
          {isCritical ? t('storageCritical') : t('storageWarning')}
        </p>
        <p className="text-xs mt-0.5 opacity-75">
          {t('storageUsage')}: {formatBytes(usage.bytes)} · {Math.round(usage.ratio * 100)}%
        </p>
        {cleared !== null && (
          <p className="text-xs mt-1 font-medium">{t('cleared')}: {cleared} tasks</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleClear}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
            ${isCritical
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-amber-600 hover:bg-amber-700 text-white'}`}
        >
          <Trash2 size={12} />
          {t('clearOldTasks')}
        </button>
        <button onClick={() => setDismissed(true)} className="p-1 rounded opacity-60 hover:opacity-100">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
