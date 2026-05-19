import React from 'react'
import { BudgetProvider, useBudget } from './context/BudgetContext.jsx'
import BottomNav from './components/BottomNav.jsx'
import AddTab from './components/tabs/AddTab.jsx'
import DashboardTab from './components/tabs/DashboardTab.jsx'
import HistoryTab from './components/tabs/HistoryTab.jsx'
import BudgetTab from './components/tabs/BudgetTab.jsx'

function AppContent() {
  const { activeTab } = useBudget()

  return (
    <div className="flex flex-col h-screen bg-panel-950 max-w-lg mx-auto relative">
      <main className="flex-1 overflow-y-auto pb-nav overscroll-none bg-panel-950">
        {activeTab === 'add'       && <AddTab key="add" />}
        {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
        {activeTab === 'history'   && <HistoryTab key="history" />}
        {activeTab === 'budget'    && <BudgetTab key="budget" />}
      </main>
      <BottomNav />
    </div>
  )
}

export default function App() {
  return (
    <BudgetProvider>
      <AppContent />
    </BudgetProvider>
  )
}
