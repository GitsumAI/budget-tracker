import { EXPENSE_CATEGORIES } from '../data/categories.js'
import { formatShortMonthYear, prevMonth } from './formatters.js'

export function filterByMonth(transactions, year, month) {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return transactions.filter(t => t.date.startsWith(prefix))
}

export function getIncome(transactions) {
  return transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getExpenses(transactions) {
  return transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0)
}

export function getCashFlow(income, expenses) {
  return income - expenses
}

export function getSavingsRate(income, expenses) {
  if (income <= 0) return 0
  return Math.max(0, (income - expenses) / income)
}

export function getSpendingByCategory(transactions) {
  const map = {}
  transactions
    .filter(t => t.type === 'Expense')
    .forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export function getLast6MonthsData(transactions, year, month) {
  const months = []
  let y = year, m = month
  for (let i = 0; i < 6; i++) {
    const monthly = filterByMonth(transactions, y, m)
    months.unshift({
      label: formatShortMonthYear(y, m),
      income:   getIncome(monthly),
      expenses: getExpenses(monthly),
      cashFlow: getCashFlow(getIncome(monthly), getExpenses(monthly)),
    })
    const prev = prevMonth(y, m)
    y = prev.year; m = prev.month
  }
  return months
}

export function getBudgetVsActual(transactions, budgets, year, month) {
  const monthly = filterByMonth(transactions, year, month)
  const spending = {}
  monthly.filter(t => t.type === 'Expense').forEach(t => {
    spending[t.category] = (spending[t.category] || 0) + t.amount
  })

  const rows = EXPENSE_CATEGORIES.map(cat => {
    const budget = budgets[cat]?.amount || 0
    const actual = spending[cat] || 0
    const variance = actual - budget
    const pct = budget > 0 ? actual / budget : actual > 0 ? 1 : 0
    return { category: cat, budget, actual, variance, pct }
  }).filter(r => r.budget > 0 || r.actual > 0)

  return rows.sort((a, b) => b.variance - a.variance)
}

export function getInsights(transactions, budgets, year, month) {
  const monthly = filterByMonth(transactions, year, month)
  const income   = getIncome(monthly)
  const expenses = getExpenses(monthly)
  const spending = getSpendingByCategory(monthly)
  const bva      = getBudgetVsActual(monthly, budgets, year, month)
  const insights = []

  if (spending.length > 0) {
    const top = spending[0]
    insights.push(`${top.category} is your largest expense category this month at ${formatCAD(top.amount)}.`)
  }

  if (income > 0) {
    const rate = getSavingsRate(income, expenses)
    const pct = (rate * 100).toFixed(1)
    if (rate >= 0.20) {
      insights.push(`You're on track for a ${pct}% savings rate this month. ✅`)
    } else {
      insights.push(`Your savings rate this month is ${pct}% — below your 20% target.`)
    }
  }

  const over = bva.filter(r => r.variance > 0)
  if (over.length > 0) {
    insights.push(`${over.length} ${over.length === 1 ? 'category is' : 'categories are'} over budget this month.`)
  } else if (bva.length > 0) {
    insights.push('All categories are within budget this month. Great work!')
  }

  return insights
}

function formatCAD(amount) {
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function generateEmailReport(transactions, budgets, year, month) {
  const monthly   = filterByMonth(transactions, year, month)
  const income    = getIncome(monthly)
  const expenses  = getExpenses(monthly)
  const cashFlow  = getCashFlow(income, expenses)
  const savRate   = getSavingsRate(income, expenses)
  const bva       = getBudgetVsActual(monthly, budgets, year, month)

  const MONTHS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December']
  const monthName = MONTHS[month - 1]
  const today = new Date()
  const todayStr = `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`

  const c = (n) => `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pad = (s, l) => String(s).padEnd(l, ' ')
  const lpad = (s, l) => String(s).padStart(l, ' ')

  const savEmoji = savRate >= 0.20 ? '✅' : '⚠️'

  let body = `BUDGET REPORT — ${monthName.toUpperCase()} ${year}\n`
  body += `Generated: ${todayStr}\n`
  body += `${'='.repeat(40)}\n\n`

  body += `SUMMARY\n`
  body += `Total Income:   ${lpad(c(income), 12)}\n`
  body += `Total Expenses: ${lpad(c(expenses), 12)}\n`
  body += `Net Cash Flow:  ${lpad(c(cashFlow), 12)}\n`
  body += `Savings Rate:   ${lpad((savRate * 100).toFixed(1) + '%', 11)}  ${savEmoji} (Target: 20%)\n\n`

  body += `${'='.repeat(40)}\n`
  body += `BUDGET VS ACTUAL\n`
  body += `${'='.repeat(40)}\n\n`
  body += `${pad('Category', 22)}${pad('Budgeted', 12)}${pad('Actual', 12)}Variance\n`

  bva.forEach(r => {
    const varStr = r.variance === 0 ? c(0) : (r.variance > 0 ? '+' : '') + c(r.variance)
    body += `${pad(r.category, 22)}${pad(c(r.budget), 12)}${pad(c(r.actual), 12)}${varStr}\n`
  })

  const over = bva.filter(r => r.variance > 0).sort((a, b) => b.variance - a.variance)
  if (over.length > 0) {
    body += `\n${'='.repeat(40)}\n`
    body += `OVER BUDGET CATEGORIES\n`
    body += `${'='.repeat(40)}\n\n`
    over.forEach(r => {
      const pctOver = r.budget > 0 ? ((r.variance / r.budget) * 100).toFixed(1) : '—'
      body += `⚠️  ${r.category}: ${c(r.variance)} over (${pctOver}% over budget)\n`
    })
  }

  body += `\n${'='.repeat(40)}\n`
  body += `TRANSACTIONS THIS MONTH: ${monthly.length}\n`
  body += `${'='.repeat(40)}\n\n`

  const SHORT_M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  body += `${pad('Date', 14)}${pad('Category', 20)}${pad('Description', 24)}Amount\n`

  const sorted = [...monthly].sort((a, b) => a.date.localeCompare(b.date))
  sorted.forEach(t => {
    const [y2, mo, d] = t.date.split('-').map(Number)
    const dateStr = `${SHORT_M[mo - 1]} ${String(d).padStart(2, '0')}`
    const desc = (t.description || t.subcategory || '').substring(0, 22)
    body += `${pad(dateStr, 14)}${pad(t.category, 20)}${pad(desc, 24)}${t.type === 'Expense' ? '' : '+'}${c(t.amount)}\n`
  })

  body += `\n${'='.repeat(40)}\n`
  body += `Exported from Budget Tracker App\n`
  body += `Paste this into your Claude Finance Project for deeper analysis.\n`
  body += `${'='.repeat(40)}\n`

  const subject = `Budget Report — ${monthName} ${year}`
  return { subject, body }
}

export function generateCSV(transactions) {
  const header = 'Date,Category,Subcategory,Description,Amount,Type,Payment Method,Tag'
  const rows = transactions.map(t => {
    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`
    return [
      t.date,
      esc(t.category),
      esc(t.subcategory),
      esc(t.description),
      t.amount.toFixed(2),
      t.type,
      esc(t.paymentMethod),
      esc(t.tag),
    ].join(',')
  })
  return [header, ...rows].join('\n')
}
