import { useState, useEffect } from 'react'
import { Briefcase, Clock, TrendingUp, Zap, ChevronRight, Sparkles } from 'lucide-react'
import { Case } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getUserId = (): string => {
  const stored = localStorage.getItem('casely_user_id')
  if (stored) return stored
  const newId = crypto.randomUUID ? crypto.randomUUID() : generateUUID()
  localStorage.setItem('casely_user_id', newId)
  return newId
}

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

interface CaseListProps {
  onStartInterview: (sessionId: string, caseId: string) => void
}

const difficultyConfig: Record<string, { color: string; icon: typeof Zap }> = {
  easy: { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: Zap },
  medium: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', icon: TrendingUp },
  hard: { color: 'text-rose-400 bg-rose-400/10 border-rose-400/20', icon: Sparkles },
}

const typeConfig: Record<string, string> = {
  'market-entry': 'Market Entry',
  'profitability': 'Profitability',
  'growth': 'Growth Strategy',
  'ma': 'M&A',
  'operations': 'Operations',
}

export default function CaseList({ onStartInterview }: CaseListProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState<string | null>(null)
  const [hoveredCase, setHoveredCase] = useState<string | null>(null)

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/cases`)
      if (!response.ok) throw new Error('Failed to fetch cases')
      const data = await response.json()
      setCases(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleStartInterview = async (caseId: string) => {
    try {
      setStarting(caseId)
      const userId = getUserId()
      const response = await fetch(`${API_URL}/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, case_id: caseId }),
      })

      if (!response.ok) throw new Error('Failed to start session')
      const data = await response.json()
      onStartInterview(data.session_id, caseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start interview')
    } finally {
      setStarting(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-radial flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-lg">Loading cases...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 bg-gradient-radial flex items-center justify-center p-4">
        <div className="glass-card rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={fetchCases}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-radial">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
              <span className="gradient-text">Case.ly</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Master your consulting interviews with AI-powered case practice.
              Select a case below to begin your session.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span>{cases.length} Cases Available</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>30-45 min each</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-20">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((caseItem, index) => {
            const difficulty = difficultyConfig[caseItem.difficulty?.toLowerCase() || 'medium']
            const DifficultyIcon = difficulty?.icon || TrendingUp
            const isHovered = hoveredCase === caseItem.id
            const isStarting = starting === caseItem.id

            return (
              <div
                key={caseItem.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredCase(caseItem.id)}
                onMouseLeave={() => setHoveredCase(null)}
              >
                <div
                  className={`
                    glass-card rounded-2xl p-5 sm:p-6 h-full flex flex-col
                    transition-all duration-300 cursor-pointer
                    ${isHovered ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10 -translate-y-1' : ''}
                  `}
                  onClick={() => !isStarting && handleStartInterview(caseItem.id)}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                    {caseItem.difficulty && (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${difficulty?.color || 'text-slate-400 bg-slate-400/10 border-slate-400/20'}`}>
                        <DifficultyIcon className="w-3.5 h-3.5" />
                        <span className="capitalize">{caseItem.difficulty}</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <h2 className="text-lg sm:text-xl font-semibold text-white mb-2 line-clamp-2">
                    {caseItem.title}
                  </h2>

                  {caseItem.case_type && (
                    <p className="text-slate-400 text-sm mb-4">
                      {typeConfig[caseItem.case_type] || caseItem.case_type}
                    </p>
                  )}

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Action */}
                  <div className={`
                    flex items-center justify-between mt-4 pt-4 border-t border-white/5
                    transition-colors duration-300
                    ${isHovered ? 'border-indigo-500/30' : ''}
                  `}>
                    <span className={`text-sm font-medium transition-colors ${isHovered ? 'text-indigo-400' : 'text-slate-400'}`}>
                      {isStarting ? 'Starting...' : 'Start Interview'}
                    </span>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${isHovered ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}
                      ${isStarting ? 'animate-pulse' : ''}
                    `}>
                      {isStarting ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className={`w-4 h-4 transition-transform ${isHovered ? 'translate-x-0.5' : ''}`} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {cases.length === 0 && (
          <div className="glass-card rounded-2xl p-8 sm:p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Cases Available</h3>
            <p className="text-slate-400">
              Please initialize the database with some cases to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
