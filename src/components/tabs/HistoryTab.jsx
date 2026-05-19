import React, { useState, useMemo } from 'react'
import { useBudget } from '../../context/BudgetContext.jsx'
import { formatCurrency, formatDate, currentMonthYear } from '../../utils/formatters.js'
import { filterByMonth, generateCSV } from '../../utils/calculations.js'
import { getCategoryColor } from '../../data/categories.js'

const FILTERS = ['All', 'This Month', 'Last Month', 'Expenses', 'Income']

function TransactionRow({ transaction, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isExpense = transaction.type === 'Expense'
  const dotColor  = getCategoryColor(transaction.category)

  return (
    <div style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }} className="last:border-0">
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setExpanded(e => !e)}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-200 truncate">
            {transaction.description || transaction.subcategory || transaction.category}
          </p>
          <p className="text-xs text-slate-600 truncate">{transaction.category} · {formatDate(transaction.date)}</p>
        </div>
        <span className={`text-sm font-bold font-mono flex-shrink-0 ${isExpense ? 'text-red-400' : 'text-emerald-400'}`}>
          {isExpense ? '-' : '+'}{formatCurrency(transaction.amount)}
        </span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={`w-4 h-4 text-slate-700 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(148,163,184,0.06)' }}>
          <div className="grid grid-cols-2 gap-y-2 pt-3 text-sm">
            {[
              ['Type', transaction.type],
              ['Amount', formatCurrency(transaction.amount)],
              ['Date', formatDate(transaction.date)],
              ['Category', transaction.category],
              transaction.subcategory   && ['Subcategory', transaction.subcategory],
              transaction.description   && ['Note', transaction.description],
              transaction.paymentMethod && ['Payment', transaction.paymentMethod],
              transaction.tag           && ['Tag', transaction.tag],
            ].filter(Boolean).map(([label, val]) => (
              <React.Fragment key={label}>
                <span className="text-slate-600 font-medium">{label}</span>
                <span className="text-slate-300 font-semibold">{val}</span>
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => onEdit(transaction)}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors"
              style={{ background: 'rgba(34,211,238,0.1)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}>
              Edit
            </button>
            <button onClick={() => onDelete(transaction.id)}
              className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors"
              style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryTab() {
  const { transactions, deleteTransaction, setEditingTransaction } = useBudget()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const now = currentMonthYear()

  const filtered = useMemo(() => {
    let result = [...transactions].sort((a, b) => b.date.localeCompare(a.date))

    if (filter === 'This Month') {
      result = filterByMonth(result, now.year, now.month)
    } else if (filter === 'Last Month') {
      const y = now.month === 1 ? now.year - 1 : now.year
      const m = now.month === 1 ? 12 : now.month - 1
      result = filterByMonth(result, y, m)
    } else if (filter === 'Expenses') {
      result = result.filter(t => t.type === 'Expense')
    } else if (filter === 'Income') {
      result = result.filter(t => t.type === 'Income')
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.subcategory?.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      )
    }
    return result
  }, [transactions, filter, search, now.year, now.month])

  function handleDelete(id) {
    if (window.confirm('Delete this transaction?')) deleteTransaction(id)
  }

  function handleExport() {
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December']
    let filename = 'Budget_All.csv'
    if (filter === 'This Month') filename = `Budget_${MONTHS[now.month - 1]}_${now.year}.csv`
    else if (filter === 'Last Month') {
      const m = now.month === 1 ? 12 : now.month - 1
      const y = now.month === 1 ? now.year - 1 : now.year
      filename = `Budget_${MONTHS[m - 1]}_${y}.csv`
    }
    const csv  = generateCSV(filtered)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href  = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="slide-up min-h-full bg-panel-950">
      {/* Header */}
      <div className="tech-grid px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg,#0A0F1E 0%,#0D1A2E 60%,#0A1628 100%)' }}>
        <h1 className="text-slate-100 text-xl font-bold tracking-tight mb-3">History</h1>
        <div className="relative">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search description or category…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoCorrect="off"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(148,163,184,0.1)',
              color: '#CBD5E1',
            }}
          />
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide"
        style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all border"
            style={filter === f
              ? { background: 'rgba(34,211,238,0.15)', color: '#22D3EE', borderColor: 'rgba(34,211,238,0.4)' }
              : { background: '#0C1220', color: '#64748B', borderColor: 'rgba(148,163,184,0.12)' }
            }>
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 mb-3 opacity-40">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1 text-slate-700">Try a different filter or add some transactions</p>
          </div>
        ) : (
          filtered.map(t => (
            <TransactionRow key={t.id} transaction={t}
              onEdit={tx => setEditingTransaction(tx)}
              onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Export */}
      {filtered.length > 0 && (
        <div className="px-4 py-4">
          <button onClick={handleExport}
            className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all"
            style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.1)', color: '#94A3B8' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export {filtered.length} Transaction{filtered.length !== 1 ? 's' : ''} as CSV
          </button>
          <p className="text-xs text-slate-700 text-center mt-2">Paste the CSV into your Claude Finance Project</p>
        </div>
      )}
      <div className="h-4" />
    </div>
  )
}
