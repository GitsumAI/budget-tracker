import React, { useState, useEffect, useRef } from 'react'
import { useBudget } from '../../context/BudgetContext.jsx'
import {
  EXPENSE_CATEGORIES, INCOME_CATEGORIES,
  SUBCATEGORIES, PAYMENT_METHODS, TAGS,
} from '../../data/categories.js'
import { todayISO } from '../../utils/formatters.js'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Pill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 border ${
        active
          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(34,211,238,0.2)]'
          : 'bg-panel-800 text-slate-400 border-slate-700/50 hover:border-slate-500'
      }`}
    >
      {label}
    </button>
  )
}

function PillRow({ items, selected, onSelect, allowDeselect = false }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {items.map(item => (
        <Pill
          key={item}
          label={item}
          active={selected === item}
          onClick={() => {
            if (allowDeselect && selected === item) onSelect('')
            else onSelect(item)
          }}
        />
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">{children}</p>
  )
}

// ─── Image resize helper ───────────────────────────────────────────────────────
function resizeImage(file, maxSize = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img
      if (width > maxSize || height > maxSize) {
        const ratio = Math.min(maxSize / width, maxSize / height)
        width  = Math.floor(width  * ratio)
        height = Math.floor(height * ratio)
      }
      canvas.width  = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(blob => {
        if (!blob) { reject(new Error('Failed to resize image')); return }
        const reader = new FileReader()
        reader.onload = () => resolve({
          base64:    reader.result.split(',')[1],
          mediaType: 'image/jpeg',
          preview:   reader.result,
        })
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }, 'image/jpeg', quality)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AddTab() {
  const { addTransaction, updateTransaction, editingTransaction, setEditingTransaction } = useBudget()
  const isEditing = !!editingTransaction

  const [type, setType]               = useState('Expense')
  const [amount, setAmount]           = useState('')
  const [date, setDate]               = useState(todayISO())
  const [category, setCategory]       = useState('')
  const [subcategory, setSubcategory] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('')
  const [tag, setTag]                 = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError]             = useState('')

  // Receipt scan state
  const [scanState, setScanState]     = useState('idle') // idle | scanning | done | error
  const [scanPreview, setScanPreview] = useState(null)
  const [scanError, setScanError]     = useState('')
  const fileInputRef = useRef(null)
  const amountRef    = useRef(null)

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type)
      setAmount(String(editingTransaction.amount))
      setDate(editingTransaction.date)
      setCategory(editingTransaction.category)
      setSubcategory(editingTransaction.subcategory || '')
      setDescription(editingTransaction.description || '')
      setPaymentMethod(editingTransaction.paymentMethod || '')
      setTag(editingTransaction.tag || '')
    }
  }, [editingTransaction])

  const categories   = type === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  const subcategories = category ? (SUBCATEGORIES[category] || []) : []

  function resetForm() {
    setAmount(''); setDescription(''); setSubcategory('')
    setPaymentMethod(''); setTag(''); setError('')
    setScanState('idle'); setScanPreview(null); setScanError('')
  }

  function cancelEdit() {
    setEditingTransaction(null)
    resetForm()
    setCategory(''); setType('Expense'); setDate(todayISO())
  }

  function handleTypeToggle(newType) {
    setType(newType); setCategory(''); setSubcategory('')
  }

  function handleCategorySelect(cat) {
    setCategory(cat); setSubcategory('')
  }

  function handleSave() {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount.')
      amountRef.current?.focus()
      return
    }
    if (!category) { setError('Please select a category.'); return }
    setError('')

    const t = {
      id:          editingTransaction?.id || crypto.randomUUID(),
      date, category, subcategory,
      description: description.trim(),
      amount:      parseFloat(parseFloat(amount).toFixed(2)),
      type, paymentMethod, tag,
      createdAt:   editingTransaction?.createdAt || Date.now(),
    }

    if (isEditing) updateTransaction(t)
    else           addTransaction(t)

    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 1800)
    if (isEditing) cancelEdit()
    else           resetForm()
  }

  // ─── Receipt Scanning ─────────────────────────────────────────────────────

  async function handleFileSelected(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = '' // allow re-selecting same file

    setScanState('scanning')
    setScanError('')
    setScanPreview(null)

    try {
      const { base64, mediaType, preview } = await resizeImage(file)
      setScanPreview(preview)

      const res = await fetch('/api/scan-receipt', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: base64, mediaType }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Server error ${res.status}`)
      }

      const data = await res.json()

      // Fill the form with extracted data
      if (data.amount)        setAmount(String(data.amount))
      if (data.date)          setDate(data.date)
      if (data.description)   setDescription(data.description)
      if (data.category && categories.includes(data.category)) {
        setCategory(data.category)
        if (data.subcategory) setSubcategory(data.subcategory)
      }
      if (data.paymentMethod && PAYMENT_METHODS.includes(data.paymentMethod)) {
        setPaymentMethod(data.paymentMethod)
      }
      if (data.tag && TAGS.includes(data.tag)) setTag(data.tag)

      setScanState('done')
    } catch (err) {
      console.error('Scan error:', err)
      const isLocalhost = window.location.hostname === 'localhost'
      setScanError(
        isLocalhost
          ? 'Receipt scanning works in the deployed app. Deploy to Vercel to use this feature.'
          : err.message || 'Could not read the receipt. Please fill in manually.'
      )
      setScanState('error')
    }
  }

  const scanBtnLabel = {
    idle:     '📷  Scan Receipt',
    scanning: '⏳  Analysing…',
    done:     '✓  Receipt Scanned',
    error:    '⚠️  Scan Failed',
  }[scanState]

  const scanBtnClass = {
    idle:     'border-slate-700/50 text-slate-400 hover:border-cyan-500/50 hover:text-cyan-400',
    scanning: 'border-cyan-500/50 text-cyan-400 pulse-glow',
    done:     'border-emerald-500/50 text-emerald-400',
    error:    'border-red-500/50 text-red-400',
  }[scanState]

  return (
    <div className="slide-up min-h-full bg-panel-950">
      {/* Header */}
      <div className="tech-grid px-4 pt-12 pb-5"
        style={{ background: 'linear-gradient(160deg,#0A0F1E 0%,#0D1A2E 60%,#0A1628 100%)' }}>
        <div className="flex items-center justify-between">
          <h1 className="text-slate-100 text-xl font-bold tracking-tight">
            {isEditing ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          {isEditing && (
            <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-full border border-cyan-500/30">
              Editing
            </span>
          )}
        </div>
        {isEditing && (
          <p className="text-slate-500 text-xs mt-1">Make your changes then tap Update</p>
        )}
      </div>

      <div className="px-4 py-5 space-y-5">

        {/* ── Scan Receipt ── */}
        {!isEditing && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelected}
            />
            <button
              type="button"
              disabled={scanState === 'scanning'}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full py-3 rounded-2xl border text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${scanBtnClass}`}
            >
              {scanBtnLabel}
            </button>

            {/* Preview thumbnail */}
            {scanPreview && (
              <div className="mt-2 flex items-center gap-3 p-3 bg-panel-800 rounded-xl border border-slate-700/50">
                <img src={scanPreview} alt="Receipt" className="w-12 h-12 object-cover rounded-lg" />
                <div>
                  <p className="text-xs font-semibold text-slate-300">Receipt image</p>
                  <p className="text-xs text-slate-500">
                    {scanState === 'done' ? 'Form filled from receipt — review below' : 'Processing…'}
                  </p>
                </div>
              </div>
            )}

            {/* Scan error */}
            {scanError && (
              <p className="mt-2 text-xs text-red-400 bg-red-900/20 border border-red-500/30 rounded-xl px-3 py-2">
                {scanError}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-xs text-slate-600 font-medium">OR ENTER MANUALLY</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* ── Type Toggle ── */}
        {!isEditing && (
          <div className="flex bg-panel-800 rounded-2xl p-1 border border-slate-700/50">
            <button type="button" onClick={() => handleTypeToggle('Expense')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                type === 'Expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_8px_rgba(248,113,113,0.2)]'
                  : 'text-slate-500'
              }`}>
              EXPENSE
            </button>
            <button type="button" onClick={() => handleTypeToggle('Income')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                type === 'Income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_8px_rgba(74,222,128,0.2)]'
                  : 'text-slate-500'
              }`}>
              INCOME
            </button>
          </div>
        )}

        {/* ── Amount ── */}
        <div>
          <SectionLabel>Amount</SectionLabel>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-500">$</span>
            <input
              ref={amountRef}
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9.]/g, '')
                const parts = v.split('.')
                if (parts.length <= 2 && (parts[1] === undefined || parts[1].length <= 2)) setAmount(v)
              }}
              className="w-full pl-10 pr-4 py-4 text-3xl font-bold bg-panel-800 border border-slate-700/50 rounded-2xl text-slate-100 placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] transition-all"
              autoComplete="off"
            />
          </div>
          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        </div>

        {/* ── Date ── */}
        <div>
          <SectionLabel>Date</SectionLabel>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-panel-800 border border-slate-700/50 rounded-2xl text-slate-300 font-medium focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] transition-all"
          />
        </div>

        {/* ── Category ── */}
        <div>
          <SectionLabel>Category</SectionLabel>
          <PillRow items={categories} selected={category} onSelect={handleCategorySelect} />
        </div>

        {/* ── Subcategory ── */}
        {subcategories.length > 0 && (
          <div>
            <SectionLabel>Subcategory</SectionLabel>
            <PillRow items={subcategories} selected={subcategory} onSelect={setSubcategory} allowDeselect />
          </div>
        )}

        {/* ── Description ── */}
        <div>
          <SectionLabel>Description <span className="normal-case font-normal text-slate-600">(optional)</span></SectionLabel>
          <input
            type="text"
            placeholder="e.g. Superstore run"
            value={description}
            onChange={e => setDescription(e.target.value)}
            autoCorrect="off"
            autoCapitalize="sentences"
            className="w-full px-4 py-3 bg-panel-800 border border-slate-700/50 rounded-2xl text-slate-300 placeholder-slate-700 focus:outline-none focus:border-cyan-500/60 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.1)] transition-all"
          />
        </div>

        {/* ── Payment Method ── */}
        <div>
          <SectionLabel>Payment Method</SectionLabel>
          <PillRow items={PAYMENT_METHODS} selected={paymentMethod} onSelect={setPaymentMethod} allowDeselect />
        </div>

        {/* ── Tag ── */}
        <div>
          <SectionLabel>Tag</SectionLabel>
          <PillRow items={TAGS} selected={tag} onSelect={setTag} allowDeselect />
        </div>

        {/* ── Actions ── */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-4 rounded-2xl text-lg font-bold text-white transition-all duration-150 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#0891B2 0%,#22D3EE 100%)',
              boxShadow:  '0 0 20px rgba(34,211,238,0.25)',
            }}
          >
            {isEditing ? '✓  Update Transaction' : '+ Save Transaction'}
          </button>
          {isEditing && (
            <button type="button" onClick={cancelEdit}
              className="w-full py-3 bg-panel-800 text-slate-400 text-base font-semibold rounded-2xl border border-slate-700/50">
              Cancel
            </button>
          )}
        </div>

        <div className="h-4" />
      </div>

      {/* Success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="success-pop fade-out bg-panel-900 rounded-3xl border border-slate-700/50 shadow-[0_0_40px_rgba(34,211,238,0.15)] px-10 py-8 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="3"
                strokeLinecap="round" strokeLinejoin="round" className="w-9 h-9">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-slate-100 font-bold text-lg">{isEditing ? 'Updated!' : 'Saved!'}</p>
          </div>
        </div>
      )}
    </div>
  )
}
