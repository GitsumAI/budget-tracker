import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useBudget } from '../../context/BudgetContext.jsx'
import { generateFinancialContext, generateProjectSyncText } from '../../utils/calculations.js'
import { getConversations, saveConversations, clearConversations } from '../../utils/storage.js'

const SUGGESTED = [
  'How am I doing this month?',
  'Where am I overspending?',
  'Am I on track for my savings goal?',
  'Compare my last 3 months',
  'What should I cut to save more?',
  'How much am I spending on food?',
]

function UserBubble({ content }) {
  return (
    <div className="flex justify-end mb-3">
      <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-sm text-sm text-white"
        style={{ background: 'linear-gradient(135deg,#0891B2,#22D3EE)' }}>
        {content}
      </div>
    </div>
  )
}

function AdvisorBubble({ content }) {
  // Simple markdown-ish rendering: bold **text**, bullet points
  const lines = content.split('\n')
  return (
    <div className="flex justify-start mb-3">
      <div className="flex gap-2 max-w-[88%]">
        {/* Avatar */}
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}>
          <span className="text-xs">✦</span>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm text-slate-200 leading-relaxed"
          style={{ background: '#111927', border: '1px solid rgba(148,163,184,0.1)' }}>
          {lines.map((line, i) => {
            if (!line.trim()) return <div key={i} className="h-2" />
            // Bold: **text**
            const parts = line.split(/\*\*(.*?)\*\*/)
            return (
              <p key={i} className={`${i > 0 && lines[i-1].trim() ? '' : ''}`}>
                {parts.map((part, j) =>
                  j % 2 === 1
                    ? <strong key={j} className="text-cyan-400 font-semibold">{part}</strong>
                    : part
                )}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
          style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}>
          <span className="text-xs">✦</span>
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm"
          style={{ background: '#111927', border: '1px solid rgba(148,163,184,0.1)' }}>
          <div className="flex gap-1 items-center h-4">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-500 opacity-60"
                style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdvisorTab() {
  const { transactions, budgets } = useBudget()
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copyState, setCopyState] = useState('idle') // idle | copied
  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)

  // Load conversation history from localStorage
  useEffect(() => {
    setMessages(getConversations())
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return

    const userMsg = { role: 'user', content: text.trim(), id: crypto.randomUUID() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    saveConversations(updated)
    setInput('')
    setIsLoading(true)

    try {
      const financialContext = generateFinancialContext(transactions, budgets)

      // Send only role+content to the API (strip our internal id field)
      const apiMessages = updated.map(m => ({ role: m.role, content: m.content }))

      const isLocalhost = window.location.hostname === 'localhost'
      if (isLocalhost) {
        // Simulate response in dev mode
        await new Promise(r => setTimeout(r, 1200))
        const devMsg = {
          role:    'assistant',
          content: 'Receipt scanning and the Advisor work in the deployed app on Vercel. Deploy your app to start chatting with your financial advisor!',
          id:      crypto.randomUUID(),
        }
        const withDev = [...updated, devMsg]
        setMessages(withDev)
        saveConversations(withDev)
        setIsLoading(false)
        return
      }

      const res = await fetch('/api/advisor', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: apiMessages, financialContext }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Error ${res.status}`)
      }

      const data = await res.json()
      const assistantMsg = { role: 'assistant', content: data.content, id: crypto.randomUUID() }
      const withResponse = [...updated, assistantMsg]
      setMessages(withResponse)
      saveConversations(withResponse)
    } catch (err) {
      const errMsg = {
        role:    'assistant',
        content: `Sorry, I ran into an error: ${err.message}. Please try again.`,
        id:      crypto.randomUUID(),
      }
      const withErr = [...updated, errMsg]
      setMessages(withErr)
      saveConversations(withErr)
    } finally {
      setIsLoading(false)
    }
  }, [messages, transactions, budgets, isLoading])

  function handleNewConversation() {
    if (messages.length === 0) return
    if (window.confirm('Start a new conversation? Your current chat will be cleared.')) {
      clearConversations()
      setMessages([])
    }
  }

  async function handleSyncToProject() {
    const text = generateProjectSyncText(transactions, budgets)
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 3000)
    } catch {
      // Fallback for browsers that block clipboard
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 3000)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full bg-panel-950" style={{ minHeight: '100%' }}>
      {/* Header */}
      <div className="tech-grid flex-shrink-0 px-4 pt-12 pb-4"
        style={{ background: 'linear-gradient(160deg,#0A0F1E 0%,#0D1A2E 60%,#0A1628 100%)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-slate-100 text-xl font-bold tracking-tight">AI Advisor</h1>
            <p className="text-slate-500 text-xs mt-0.5">Powered by your real financial data</p>
          </div>
          {messages.length > 0 && (
            <button onClick={handleNewConversation}
              className="text-xs text-slate-500 border border-slate-700/50 px-2.5 py-1.5 rounded-xl">
              New Chat
            </button>
          )}
        </div>

        {/* Sync to Claude Project button */}
        <button onClick={handleSyncToProject}
          className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
          style={copyState === 'copied'
            ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ADE80' }
            : { background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)', color: '#94A3B8' }
          }>
          {copyState === 'copied' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied! Paste into your Claude Finance Project
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
              </svg>
              Sync to Claude.ai Finance Project
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty ? (
          <div>
            {/* Welcome */}
            <div className="text-center mb-6 pt-2">
              <div className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl"
                style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
                ✦
              </div>
              <p className="text-slate-200 font-semibold">Your Financial Advisor</p>
              <p className="text-slate-500 text-sm mt-1">
                Ask me anything about your spending,<br />savings, or budget.
              </p>
            </div>

            {/* Suggested questions */}
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 text-center">Try asking</p>
            <div className="space-y-2">
              {SUGGESTED.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm text-slate-300 transition-all active:opacity-70"
                  style={{ background: '#0C1220', border: '1px solid rgba(148,163,184,0.08)' }}>
                  <span className="text-cyan-500/50 mr-2">›</span>{q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg =>
              msg.role === 'user'
                ? <UserBubble key={msg.id} content={msg.content} />
                : <AdvisorBubble key={msg.id} content={msg.content} />
            )}
            {isLoading && <TypingIndicator />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ borderTop: '1px solid rgba(148,163,184,0.06)', background: 'rgba(7,11,18,0.95)' }}>
        <div className="flex gap-2 items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={e => {
              setInput(e.target.value)
              // Auto-resize
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your finances…"
            className="flex-1 px-4 py-3 rounded-2xl text-sm text-slate-200 placeholder-slate-600 resize-none focus:outline-none transition-all"
            style={{
              background:  '#111927',
              border:      '1px solid rgba(148,163,184,0.12)',
              minHeight:   '44px',
              maxHeight:   '120px',
            }}
            onFocus={e  => { e.target.style.borderColor = 'rgba(34,211,238,0.4)' }}
            onBlur={e   => { e.target.style.borderColor = 'rgba(148,163,184,0.12)' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
            style={{ background: 'linear-gradient(135deg,#0891B2,#22D3EE)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-700 text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}
