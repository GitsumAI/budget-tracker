import React, { useState, useEffect } from 'react'
import { useBudget } from '../../context/BudgetContext.jsx'
import { EXPENSE_CATEGORIES, getCategoryColor } from '../../data/categories.js'
import { formatCurrency, currentMonthYear } from '../../utils/formatters.js'
import { filterByMonth } from '../../utils/calculations.js'

export default function BudgetTab() {
  const { budgets, updateBudgets, transactions } = useBudget()
  const [localBudgets, setLocalBudgets] = useState({})
  const [saved, setSaved] = useState(false)

  const now     = currentMonthYear()
  const monthly = filterByMonth(transactions, now.year, now.month)

  useEffect(() => {
    setLocalBudgets(JSON.parse(JSON.stringify(budgets)))
  }, [budgets])

  function handleAmountChange(category, value) {
    const num = value.replace(/[^0-9.]/g, '')
    setLocalBudgets(prev => ({
      ...prev,
      [category]: { ...prev[category], amount: num === '' ? 0 : parseFloat(num) || 0, _raw: num },
    }))
  }

  function handleTypeToggle(category) {
    setLocalBudgets(prev => ({
      ...prev,
      [category]: { ...prev[category], type: prev[category]?.type === 'Fixed' ? 'Variable' : 'Fixed' },
    }))
  }

  function handleSave() {
    const cleaned = {}
    EXPENSE_CATEGORIES.forEach(cat => {
      cleaned[cat] = {
        amount: parseFloat(localBudgets[cat]?.amount) || 0,
        type:   localBudgets[cat]?.type || 'Variable',
      }
    })
    updateBudgets(cleaned)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function getActualSpend(category) {
    return monthly
      .filter(t => t.type === 'Expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const totalBudget = EXPENSE_CATEGORIES.reduce(
    (sum, cat) => sum + (parseFloat(localBudgets[cat]?.amount) || 0), 0
  )

  return (
    <div className="slide-up min-h-full bg-panel-950">
      {/* Header */}
      <div className="tech-grid px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg,#0A0F1E 0%,#0D1A2E 60%,#0A1628 100%)' }}>
        <h1 className="text-slate-100 text-xl font-bold tracking-tight">Monthly Budget</h1>
        <p className="text-slate-500 text-sm mt-0.5">Set targets for each expense category</p>
      </div>

      {/* Total */}
      <div className="px-4 py-3 flex justify-between items-center"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Budget</span>
        <span className="text-lg font-bold font-mono text-cyan-400">{formatCurrency(totalBudget)}</span>
      </div>

      {/* Rows */}
      <div className="divide-y mb-4" style={{ '--tw-divide-opacity': 1, borderColor: 'transparent' }}>
        {EXPENSE_CATEGORIES.map(cat => {
          const budget   = localBudgets[cat]
          const rawVal   = budget?._raw !== undefined ? budget._raw : String(budget?.amount ?? '')
          const actual   = getActualSpend(cat)
          const budgetAmt = parseFloat(budget?.amount) || 0
          const isOver   = actual > budgetAmt && budgetAmt > 0
          const isFixed  = budget?.type === 'Fixed'

          return (
            <div key={cat} className="px-4 py-3.5"
              style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getCategoryColor(cat) }} />
                <span className="text-sm font-semibold text-slate-200 flex-1">{cat}</span>
                <button onClick={() => handleTypeToggle(cat)}
                  className="text-xs px-2.5 py-1 rounded-full font-medium border transition-all"
                  style={isFixed
                    ? { background: 'rgba(34,211,238,0.1)', color: '#22D3EE', borderColor: 'rgba(34,211,238,0.3)' }
                    : { background: '#111927', color: '#475569', borderColor: 'rgba(148,163,184,0.15)' }
                  }>
                  {isFixed ? 'Fixed' : 'Variable'}
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-medium text-sm">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={rawVal}
                    onChange={e => handleAmountChange(cat, e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-semibold transition-all focus:outline-none"
                    style={{
                      background: '#111927',
                      border: '1px solid rgba(148,163,184,0.12)',
                      color: '#CBD5E1',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(34,211,238,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(34,211,238,0.08)' }}
                    onBlur={e  => { e.target.style.borderColor = 'rgba(148,163,184,0.12)'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Actual</p>
                  <p className={`text-sm font-bold font-mono ${isOver ? 'text-red-400' : 'text-slate-400'}`}>
                    {formatCurrency(actual)}
                  </p>
                </div>
              </div>

              {budgetAmt > 0 && (
                <div className="mt-2 rounded-full h-1" style={{ background: 'rgba(148,163,184,0.1)' }}>
                  <div className="h-1 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (actual / budgetAmt) * 100)}%`,
                      background: isOver ? '#F87171' : '#4ADE80',
                    }} />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Save */}
      <div className="px-4 pb-4">
        <button onClick={handleSave}
          className="w-full py-4 text-white text-lg font-bold rounded-2xl transition-all duration-300 active:scale-95"
          style={saved
            ? { background: 'linear-gradient(135deg,#059669,#4ADE80)', boxShadow: '0 0 20px rgba(74,222,128,0.25)' }
            : { background: 'linear-gradient(135deg,#0891B2,#22D3EE)', boxShadow: '0 0 20px rgba(34,211,238,0.25)' }
          }>
          {saved ? '✓  Budgets Saved!' : 'Save Budgets'}
        </button>
      </div>
      <div className="h-4" />
    </div>
  )
}
