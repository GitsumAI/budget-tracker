const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

const SHORT_MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
]

export function formatCurrency(amount) {
  const abs = Math.abs(amount)
  const formatted = abs.toLocaleString('en-CA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `$${formatted}`
}

export function formatDate(dateString) {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  return `${SHORT_MONTHS[month - 1]} ${day}, ${year}`
}

export function formatMonthYear(year, month) {
  // month is 1-indexed
  return `${MONTH_NAMES[month - 1]} ${year}`
}

export function formatShortMonthYear(year, month) {
  return `${SHORT_MONTHS[month - 1]} ${year}`
}

export function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseISO(dateString) {
  const [y, m, d] = dateString.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function getMonthYear(dateString) {
  const [y, m] = dateString.split('-').map(Number)
  return { year: y, month: m }
}

export function prevMonth(year, month) {
  if (month === 1) return { year: year - 1, month: 12 }
  return { year, month: month - 1 }
}

export function nextMonth(year, month) {
  if (month === 12) return { year: year + 1, month: 1 }
  return { year, month: month + 1 }
}

export function currentMonthYear() {
  const d = new Date()
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

export function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`
}
