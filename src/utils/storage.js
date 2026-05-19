import { DEFAULT_BUDGETS } from '../data/categories.js'

const KEYS = {
  TRANSACTIONS: 'budget_transactions',
  BUDGETS:      'budget_budgets',
  SETTINGS:     'budget_settings',
  SAMPLE_LOADED: 'budget_sample_loaded',
}

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Transactions
export function getTransactions() {
  return safeGet(KEYS.TRANSACTIONS, [])
}

export function saveTransactions(transactions) {
  return safeSet(KEYS.TRANSACTIONS, transactions)
}

// Budgets
export function getBudgets() {
  return safeGet(KEYS.BUDGETS, DEFAULT_BUDGETS)
}

export function saveBudgets(budgets) {
  return safeSet(KEYS.BUDGETS, budgets)
}

// Settings
export function getSettings() {
  return safeGet(KEYS.SETTINGS, {
    currency: 'CAD',
    savingsGoal: 0.20,
  })
}

export function saveSettings(settings) {
  return safeSet(KEYS.SETTINGS, settings)
}

// Sample data flag
export function isSampleLoaded() {
  return safeGet(KEYS.SAMPLE_LOADED, false)
}

export function markSampleLoaded() {
  return safeSet(KEYS.SAMPLE_LOADED, true)
}

export function clearSampleFlag() {
  try { localStorage.removeItem(KEYS.SAMPLE_LOADED) } catch {}
}

// Wipe everything
export function clearAllData() {
  try {
    localStorage.removeItem(KEYS.TRANSACTIONS)
    localStorage.removeItem(KEYS.SAMPLE_LOADED)
    return true
  } catch {
    return false
  }
}
