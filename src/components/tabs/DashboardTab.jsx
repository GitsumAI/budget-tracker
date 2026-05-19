import React, { useMemo, useState } from 'react'
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer,
} from 'recharts'
import { useBudget } from '../../context/BudgetContext.jsx'
import {
  filterByMonth, getIncome, getExpenses, getCashFlow, getSavingsRate,
  getSpendingByCategory, getLast6MonthsData, getBudgetVsActual,
  getInsights, generateEmailReport,
} from '../../utils/calculations.js'
import {
  formatCurrency, formatMonthYear, prevMonth, nextMonth, currentMonthYear,
} from '../../utils/formatters.js'
import { getCategoryColor } from '../../data/categories.js'

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, glow }) {
  const glowStyles = {
    green:  { border: 'rgba(74,222,128,0.2)',  shadow: 'rgba(74,222,128,0.08)',  text: '#4ADE80' },
    red:    { border: 'rgba(248,113,113,0.2)', shadow: 'rgba(248,113,113,0.08)', text: '#F87171' },
    blue:   { border: 'rgba(96,165,250,0.2)',  shadow: 'rgba(96,165,250,0.08)',  text: '#60A5FA' },
    purple: { border: 'rgba(167,139,250,0.2)', shadow: 'rgba(167,139,250,0.08)', text: '#A78BFA' },
  }
  const g = glowStyles[glow] || glowStyles.blue

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-1"
      style={{
        background: '#0C1220',
        border: `1px solid ${g.border}`,
        boxShadow: `0 0 20px ${g.shadow}, 0 1px 3px rgba(0,0,0,0.5)`,
      }}>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="text-xl font-bold font-mono leading-tight" style={{ color: g.text }}>{value}</p>
      {sub && <p className="text-xs text-slate-600">{sub}</p>}
    </div>
  )
}

// ─── Dark Tooltip ──────────────────────────────────────────────────────────────
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-3 py-2 text-sm border"
      style={{ background: '#111927', borderColor: 'rgba(148,163,184,0.15)', boxShadow: '0 4px 20px rgba(0,0,0,0.6)' }}>
      <p className="font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

// ─── Budget Row ────────────────────────────────────────────────────────────────
function BudgetRow({ row }) {
  const pct     = Math.min(100, Math.round(row.pct * 100))
  const isOver  = row.variance > 0
  const isWarn  = !isOver && row.budget > 0 && row.pct >= 0.85
  const barClr  = isOver ? '#F87171' : isWarn ? '#FBBF24' : '#4ADE80'
  const varClr  = isOver ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-emerald-400'
  const varSign = row.variance > 0 ? '+' : ''

  return (
    <div className="py-3 border-b last:border-0" style={{ borderColor: 'rgba(148,163,184,0.06)' }}>
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getCategoryColor(row.category) }} />
          <span className="text-sm font-medium text-slate-300">{row.category}</span>
        </div>
        <span className={`text-xs font-semibold ${varClr}`}>
          {varSign}{formatCurrency(Math.abs(row.variance))}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(148,163,184,0.1)' }}>
          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: barClr }} />
        </div>
        <span className="text-xs text-slate-600 whitespace-nowrap">
          {formatCurrency(row.actual)} / {formatCurrency(row.budget)}
        </span>
      </div>
    </div>
  )
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export default function DashboardTab() {
  const { transactions, budgets, clearSampleData } = useBudget()

  const now = currentMonthYear()
  const [viewYear, setViewYear]   = useState(now.year)
  const [viewMonth, setViewMonth] = useState(now.month)

  const monthly  = useMemo(() => filterByMonth(transactions, viewYear, viewMonth), [transactions, viewYear, viewMonth])
  const income   = useMemo(() => getIncome(monthly),   [monthly])
  const expenses = useMemo(() => getExpenses(monthly), [monthly])
  const cashFlow = useMemo(() => getCashFlow(income, expenses), [income, expenses])
  const savRate  = useMemo(() => getSavingsRate(income, expenses), [income, expenses])
  const catData  = useMemo(() => getSpendingByCategory(monthly), [monthly])
  const last6    = useMemo(() => getLast6MonthsData(transactions, viewYear, viewMonth), [transactions, viewYear, viewMonth])
  const bva      = useMemo(() => getBudgetVsActual(transactions, budgets, viewYear, viewMonth), [transactions, budgets, viewYear, viewMonth])
  const insights = useMemo(() => getInsights(transactions, budgets, viewYear, viewMonth), [transactions, budgets, viewYear, viewMonth])

  const hasSample = transactions.some(t => t.id.startsWith('s'))

  function goBack()    { const p = prevMonth(viewYear, viewMonth); setViewYear(p.year); setViewMonth(p.month) }
  function goForward() { const n = nextMonth(viewYear, viewMonth); setViewYear(n.year); setViewMonth(n.month) }

  function handleEmail() {
    const { subject, body } = generateEmailReport(transactions, budgets, viewYear, viewMonth)
    const truncated = body.length > 8000 ? body.slice(0, 8000) + '\n\n[Truncated — export CSV for full list]' : body
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(truncated)}`, '_blank')
  }

  function handleClearSample() {
    if (window.confirm('Clear all sample data? Your real transactions will be kept.')) clearSampleData()
  }

  const axisStyle  = { fontSize: 10, fill: '#475569' }
  const gridColor  = 'rgba(148,163,184,0.06)'
  const chartBg    = 'transparent'

  return (
    <div className="slide-up min-h-full bg-panel-950">
      {/* Header */}
      <div className="tech-grid px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg,#0A0F1E 0%,#0D1A2E 60%,#0A1628 100%)' }}>
        <h1 className="text-slate-100 text-xl font-bold tracking-tight mb-3">Dashboard</h1>
        <div className="flex items-center justify-between rounded-2xl px-4 py-2"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(148,163,184,0.1)' }}>
          <button onClick={goBack} className="text-slate-400 p-1 active:text-cyan-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-slate-200 font-semibold text-base">
            {formatMonthYear(viewYear, viewMonth)}
          </span>
          <button onClick={goForward} className="text-slate-400 p-1 active:text-cyan-400">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* Sample data banner */}
        {hasSample && (
          <div className="rounded-2xl px-4 py-3 flex items-center justify-between gap-3"
            style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
            <div>
              <p className="text-amber-400 text-sm font-semibold">Sample data loaded</p>
              <p className="text-amber-500/70 text-xs">Showing example data — explore the app</p>
            </div>
            <button onClick={handleClearSample}
              className="bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-bold px-3 py-2 rounded-xl whitespace-nowrap active:opacity-80">
              Clear Sample
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3">
          <KPICard label="Total Income"   value={formatCurrency(income)}              glow="green" />
          <KPICard label="Total Expenses" value={formatCurrency(expenses)}             glow="red" />
          <KPICard label="Net Cash Flow"  value={formatCurrency(Math.abs(cashFlow))}
            sub={cashFlow < 0 ? 'Deficit' : 'Surplus'} glow={cashFlow >= 0 ? 'blue' : 'red'} />
          <KPICard label="Savings Rate"
            value={`${(savRate * 100).toFixed(1)}%`}
            sub={savRate >= 0.20 ? '✅ On target' : '⚠️ Below 20%'} glow="purple" />
        </div>

        {/* Income vs Expenses */}
        <div className="rounded-2xl p-4" style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.08)' }}>
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Income vs Expenses — 6 Months</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={last6} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#64748B' }} />
              <Bar dataKey="income"   name="Income"   fill="#4ADE80" radius={[3,3,0,0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#F87171" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category */}
        {catData.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.08)' }}>
            <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={Math.max(160, catData.length * 32)}>
              <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                <XAxis type="number" tick={axisStyle} tickFormatter={v => `$${v}`} />
                <YAxis type="category" dataKey="category" width={105} tick={axisStyle} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="amount" name="Amount" radius={[0,3,3,0]}>
                  {catData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={getCategoryColor(entry.category)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Cash Flow Trend */}
        <div className="rounded-2xl p-4" style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.08)' }}>
          <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Net Cash Flow — 6 Months</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={last6} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="label" tick={axisStyle} />
              <YAxis tick={axisStyle} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<DarkTooltip />} />
              <Line type="monotone" dataKey="cashFlow" name="Cash Flow"
                stroke="#22D3EE" strokeWidth={2.5}
                dot={{ fill: '#22D3EE', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#22D3EE', stroke: 'rgba(34,211,238,0.3)', strokeWidth: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Actual */}
        {bva.length > 0 && (
          <div className="rounded-2xl p-4" style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.08)' }}>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Budget vs Actual</h3>
            <p className="text-xs text-slate-600 mb-3">Sorted by worst overspending first</p>
            {bva.map(row => <BudgetRow key={row.category} row={row} />)}
          </div>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: 'linear-gradient(135deg,#0A0F1E,#0D1520)', border: '1px solid rgba(34,211,238,0.15)' }}>
            <h3 className="text-cyan-500/70 text-xs font-bold uppercase tracking-widest mb-3">💡 Monthly Insights</h3>
            <div className="space-y-2.5">
              {insights.map((insight, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-cyan-500/40 mt-0.5">›</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Email Report */}
        <button onClick={handleEmail}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold transition-all active:opacity-80"
          style={{
            background: 'rgba(34,211,238,0.06)',
            border: '1px solid rgba(34,211,238,0.25)',
            color: '#22D3EE',
          }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Email Monthly Report
        </button>

        <div className="h-2" />
      </div>
    </div>
  )
}
