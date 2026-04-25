import { ChevronLeft, ChevronRight, CalendarDays, Menu } from 'lucide-react'
import { useStore } from '../../store'
import { useLang } from '../../hooks/useLang'
import { formatDisplay, navigateDate, todayString } from '../../utils/date'
import type { ViewMode } from '../../types'
import { cn } from '../../utils/cn'

interface Props {
  activePage: string
  onMenuClick: () => void
}

function getHeaderLabel(date: string, mode: ViewMode, lang: 'en' | 'zh'): string {
  if (mode === 'day') return formatDisplay(date, lang === 'zh' ? 'M月d日' : 'MMM d, yyyy')
  if (mode === 'week') return formatDisplay(date, lang === 'zh' ? 'yyyy年M月' : 'MMM yyyy') + ' · Week'
  return formatDisplay(date, lang === 'zh' ? 'yyyy年M月' : 'MMMM yyyy')
}

export function Header({ activePage, onMenuClick }: Props) {
  const { t, lang } = useLang()
  const selectedDate = useStore(s => s.ui.selectedDate)
  const viewMode = useStore(s => s.ui.viewMode)
  const setSelectedDate = useStore(s => s.setSelectedDate)
  const setViewMode = useStore(s => s.setViewMode)

  const isNavPage = activePage === 'templates' || activePage === 'settings'
  const mode = activePage as ViewMode

  function navigate(dir: 1 | -1) {
    setSelectedDate(navigateDate(selectedDate, dir, mode))
  }

  const isToday = selectedDate === todayString()

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0 gap-2">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
      >
        <Menu size={18} />
      </button>

      {/* Left: title / date nav */}
      {isNavPage ? (
        <h1 className="text-sm font-semibold text-slate-900 flex-1">{t(activePage as any)}</h1>
      ) : (
        <div className="flex items-center gap-1 md:gap-3 flex-1 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <p className="text-sm font-semibold text-slate-900 truncate">
            {getHeaderLabel(selectedDate, mode, lang)}
          </p>

          <button
            onClick={() => navigate(1)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
          >
            <ChevronRight size={16} />
          </button>

          {!isToday && (
            <button
              onClick={() => setSelectedDate(todayString())}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shrink-0"
            >
              <CalendarDays size={12} />
              {t('today')}
            </button>
          )}
        </div>
      )}

      {/* Right: view switcher */}
      {!isNavPage && (
        <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-0.5 shrink-0">
          {(['day', 'week', 'month'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                'px-2 md:px-3 py-1 rounded-md text-xs font-medium transition-all',
                viewMode === v
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {t(v)}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}
