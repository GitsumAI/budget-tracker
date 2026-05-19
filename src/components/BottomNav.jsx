import React from 'react'
import { useBudget } from '../context/BudgetContext.jsx'

const TABS = [
  {
    id: 'add',
    label: 'Add',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 15" />
      </svg>
    ),
  },
  {
    id: 'budget',
    label: 'Budget',
    icon: (active) => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2}
        strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6"  x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
        <circle cx="18" cy="6"  r="3" fill="currentColor" stroke="none" />
        <circle cx="7"  cy="12" r="3" fill="currentColor" stroke="none" />
        <circle cx="14" cy="18" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useBudget()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className="flex border-t"
        style={{
          background: 'rgba(7,11,18,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(148,163,184,0.08)',
        }}
      >
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-2 min-h-[3.5rem] transition-all duration-150 relative"
              aria-label={tab.label}
            >
              {/* Active glow dot */}
              {isActive && (
                <span className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-cyan-400" />
              )}
              <span className={isActive ? 'text-cyan-400' : 'text-slate-600'}>
                {tab.icon(isActive)}
              </span>
              <span className={`text-xs mt-0.5 font-medium ${isActive ? 'text-cyan-400' : 'text-slate-600'}`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
