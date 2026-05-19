import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  getTransactions, saveTransactions,
  getBudgets, saveBudgets,
  getSettings, saveSettings,
  isSampleLoaded, markSampleLoaded,
} from '../utils/storage.js'
import { SAMPLE_TRANSACTIONS } from '../utils/sampleData.js'

const BudgetContext = createContext(null)

export function BudgetProvider({ children }) {
  const [transactions, setTransactions]     = useState([])
  const [budgets, setBudgets]               = useState({})
  const [settings, setSettings]             = useState({})
  const [editingTransaction, setEditingTx]  = useState(null)
  const [activeTab, setActiveTab]           = useState('add')

  // Load from localStorage on mount; pre-load sample data on first launch
  useEffect(() => {
    const stored = getTransactions()
    if (!isSampleLoaded() && stored.length === 0) {
      const withSample = [...SAMPLE_TRANSACTIONS]
      saveTransactions(withSample)
      markSampleLoaded()
      setTransactions(withSample)
    } else {
      setTransactions(stored)
    }
    setBudgets(getBudgets())
    setSettings(getSettings())
  }, [])

  const addTransaction = useCallback((t) => {
    setTransactions(prev => {
      const updated = [t, ...prev]
      saveTransactions(updated)
      return updated
    })
  }, [])

  const updateTransaction = useCallback((t) => {
    setTransactions(prev => {
      const updated = prev.map(tx => tx.id === t.id ? t : tx)
      saveTransactions(updated)
      return updated
    })
    setEditingTx(null)
  }, [])

  const deleteTransaction = useCallback((id) => {
    setTransactions(prev => {
      const updated = prev.filter(tx => tx.id !== id)
      saveTransactions(updated)
      return updated
    })
  }, [])

  const updateBudgets = useCallback((b) => {
    setBudgets(b)
    saveBudgets(b)
  }, [])

  const updateSettings = useCallback((s) => {
    setSettings(s)
    saveSettings(s)
  }, [])

  const clearSampleData = useCallback(() => {
    const userTx = transactions.filter(t => !t.id.startsWith('s'))
    saveTransactions(userTx)
    setTransactions(userTx)
  }, [transactions])

  const setEditingTransaction = useCallback((t) => {
    setEditingTx(t)
    if (t) setActiveTab('add')
  }, [])

  return (
    <BudgetContext.Provider value={{
      transactions,
      budgets,
      settings,
      editingTransaction,
      activeTab,
      setActiveTab,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      updateBudgets,
      updateSettings,
      clearSampleData,
      setEditingTransaction,
    }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const ctx = useContext(BudgetContext)
  if (!ctx) throw new Error('useBudget must be used within BudgetProvider')
  return ctx
}
