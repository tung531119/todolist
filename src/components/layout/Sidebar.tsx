import { CalendarDays, Calendar, LayoutGrid, RefreshCw, Settings, CheckSquare, X } from 'lucide-react'
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
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ activePage, onNavigate, mobileOpen, onMobileClose }: Props) {
  const { t } = useLang()

  const sidebar = (
    <aside className="w-56 shrink-0 flex flex-col h-full bg-zinc-900 border-r border-zinc-800">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center">
            <CheckSquare size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">{t('appName')}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{t('appTagline')}</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={onMobileClose}
          className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500"
        >
          <X size={16} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {NAV.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); onMobileClose() }}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              activePage === item.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100'
            )}
          >
            {item.icon}
            {t(item.labelKey as any)}
          </button>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-zinc-800">
        <p className="text-[10px] text-zinc-700">TaskFlow · Local Storage</p>
      </div>
    </aside>
  )

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:flex h-screen sticky top-0">
        {sidebar}
      </div>

      {/* Mobile: overlay drawer */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex md:hidden animate-slide-in-left">
            {sidebar}
          </div>
        </>
      )}
    </>
  )
}
