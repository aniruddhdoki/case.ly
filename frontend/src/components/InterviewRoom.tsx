import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ArrowLeft, User, Bot } from 'lucide-react'
import VoiceInput from './VoiceInput'
import AvatarPlaceholder from './AvatarPlaceholder'
import { Turn, WebSocketMessage } from '../types'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

interface InterviewRoomProps {
  sessionId: string
  caseId: string
  onEndInterview: () => void
}

export default function InterviewRoom({
  sessionId,
  caseId,
  onEndInterview,
}: InterviewRoomProps) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`${WS_URL}/ws/interview/${sessionId}`)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setConnectionStatus('connected')
        setIsListening(true)
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleWebSocketMessage(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionStatus('disconnected')
        setIsConnected(false)
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', event.code, event.reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        setIsListening(false)

        if (event.code !== 1000 && event.code !== 1001) {
          console.log('Attempting to reconnect in 3 seconds...')
          setTimeout(() => {
            if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
              connectWebSocket()
            }
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
      setConnectionStatus('disconnected')
      setIsConnected(false)
    }
  }

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    if (message.type === 'agent_message' && message.text) {
      const newTurn: Turn = {
        role: 'assistant',
        content: message.text,
      }
      setTurns((prev) => [...prev, newTurn])
      speakText(message.text)
    } else if (message.type === 'session_ended') {
      onEndInterview()
    } else if (message.type === 'error') {
      console.error('WebSocket error:', message.error)
    }
  }

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported')
      setIsListening(true)
      return
    }

    // Stop listening first
    setIsListening(false)
    setIsAgentSpeaking(true)

    // Small delay to ensure recognition is fully stopped before TTS starts
    // This prevents the mic from picking up the TTS audio
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0

      utterance.onend = () => {
        setIsAgentSpeaking(false)
        // Small delay before resuming listening to avoid picking up end of TTS
        setTimeout(() => {
          setIsListening(true)
        }, 200)
      }

      utterance.onerror = () => {
        setIsAgentSpeaking(false)
        setIsListening(true)
      }

      speechSynthesis.speak(utterance)
    }, 150)
  }

  const handleTranscript = useCallback((text: string) => {
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    const newTurn: Turn = {
      role: 'user',
      content: text,
    }
    setTurns((prev) => [...prev, newTurn])

    wsRef.current.send(
      JSON.stringify({
        type: 'user_message',
        text: text.trim(),
      })
    )

    setIsListening(false)
  }, [])

  const handleEndInterview = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }))
    }
    onEndInterview()
  }

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-radial flex flex-col">
      {/* Header */}
      <header className="glass-card border-0 border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleEndInterview}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-white">Case Interview</h1>
            <div className="flex items-center gap-2">
              {connectionStatus === 'connected' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-400">Live</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs text-amber-400">Connecting...</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs text-rose-400">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleEndInterview}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl transition-colors text-sm"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">End</span>
        </button>
      </header>

      {/* Main Content - Responsive Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Avatar & Voice */}
        <div className="lg:w-2/5 xl:w-1/3 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 lg:border-r border-white/5">
          <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm">
            {/* Avatar */}
            <div className="mb-6 sm:mb-8">
              <AvatarPlaceholder speaking={isAgentSpeaking} />
            </div>

            {/* Status Text */}
            <div className="text-center mb-6 sm:mb-8">
              {isAgentSpeaking ? (
                <div className="flex items-center gap-3 text-indigo-400">
                  <div className="voice-wave text-indigo-400">
                    <span></span><span></span><span></span><span></span><span></span>
                  </div>
                  <span className="text-sm font-medium">Interviewer speaking...</span>
                </div>
              ) : isListening ? (
                <p className="text-sm text-slate-400">
                  Listening... speak, then pause for 2 seconds
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Waiting...
                </p>
              )}
            </div>

            {/* Voice Input */}
            <VoiceInput
              onTranscript={handleTranscript}
              isListening={isListening && !isAgentSpeaking}
              setIsListening={setIsListening}
              disabled={!isConnected || isAgentSpeaking}
            />
          </div>
        </div>

        {/* Right Panel - Transcript */}
        <div className="flex-1 flex flex-col min-h-0 lg:h-auto">
          {/* Transcript Header */}
          <div className="px-4 sm:px-6 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-slate-400">Conversation</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {turns.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-slate-600" />
                  </div>
                  <p className="text-slate-500 text-sm">
                    Interview starting...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {turns.map((turn, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      turn.role === 'user' ? 'animate-slide-in-right' : 'animate-slide-in-left'
                    }`}
                    style={{ animationDelay: '0s' }}
                  >
                    {/* Avatar */}
                    <div className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                      ${turn.role === 'user'
                        ? 'bg-indigo-500/20 text-indigo-400 order-2'
                        : 'bg-slate-700 text-slate-300'
                      }
                    `}>
                      {turn.role === 'user' ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>

                    {/* Message */}
                    <div className={`
                      flex-1 ${turn.role === 'user' ? 'order-1' : ''}
                    `}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${
                          turn.role === 'user' ? 'text-indigo-400' : 'text-slate-400'
                        }`}>
                          {turn.role === 'user' ? 'You' : 'Interviewer'}
                        </span>
                      </div>
                      <div className={`
                        rounded-2xl px-4 py-3 text-sm leading-relaxed
                        ${turn.role === 'user'
                          ? 'bg-indigo-500/20 text-indigo-100 rounded-tr-md'
                          : 'bg-slate-800/80 text-slate-200 rounded-tl-md'
                        }
                      `}>
                        <p className="whitespace-pre-wrap">{turn.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
