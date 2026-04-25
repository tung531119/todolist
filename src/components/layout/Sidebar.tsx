import { CalendarDays, Calendar, LayoutGrid, RefreshCw, Settings, CheckSquare } from 'lucide-react'
import { useLang } from '../../hooks/useLang'
import type { ViewMode } from '../../types'
import { cn } from '../../utils/cn'

type NavItem = {
  id: ViewMode | 'templates' | 'settings'
  icon: React.ReactNode
  labelKey: string
}

const NAV: NavItem[] = [
  { id: 'day',       icon: <CalendarDays size={18} />, labelKey: 'day' },
  { id: 'week',      icon: <LayoutGrid size={18} />,   labelKey: 'week' },
  { id: 'month',     icon: <Calendar size={18} />,     labelKey: 'month' },
  { id: 'templates', icon: <RefreshCw size={18} />,    labelKey: 'templates' },
  { id: 'settings',  icon: <Settings size={18} />,     labelKey: 'settings' },
]

interface Props {
  activePage: string
  onNavigate: (id: string) => void
}

export function Sidebar({ activePage, onNavigate }: Props) {
  const { t } = useLang()

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
            <CheckSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">{t('appName')}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{t('appTagline')}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              activePage === item.id
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <span className={activePage === item.id ? 'text-indigo-600' : ''}>{item.icon}</span>
            {t(item.labelKey as any)}
          </button>
        ))}
      </nav>

      {/* Bottom hint */}
      <div className="px-5 py-4 border-t border-slate-100">
        <p className="text-[10px] text-slate-300">TaskFlow · Local Storage</p>
      </div>
    </aside>
  )
}
