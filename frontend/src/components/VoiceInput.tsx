import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff } from 'lucide-react'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  isListening: boolean
  setIsListening: (value: boolean) => void
  disabled?: boolean
}

export default function VoiceInput({
  onTranscript,
  isListening,
  setIsListening,
  disabled = false,
}: VoiceInputProps) {
  const [interimTranscript, setInterimTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const accumulatedTextRef = useRef<string>('')
  const interimTextRef = useRef<string>('')
  const isListeningRef = useRef<boolean>(isListening)
  const onTranscriptRef = useRef(onTranscript)

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    silenceTimerRef.current = setTimeout(() => {
      const fullText = (accumulatedTextRef.current + interimTextRef.current).trim()
      if (fullText) {
        onTranscriptRef.current(fullText)
        accumulatedTextRef.current = ''
        interimTextRef.current = ''
        setFinalTranscript('')
        setInterimTranscript('')
      }
      silenceTimerRef.current = null
    }, 2000)
  }, [])

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      console.log('Speech recognition started')
    }

    recognition.onaudiostart = () => {
      console.log('Audio capture started')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          final += transcript + ' '
        } else {
          interim += transcript
        }
      }

      if (final) {
        accumulatedTextRef.current += final
        interimTextRef.current = ''
        setFinalTranscript(accumulatedTextRef.current)
        setInterimTranscript('')
        resetSilenceTimer()
      } else if (interim) {
        interimTextRef.current = interim
        setInterimTranscript(interim)
        resetSilenceTimer()
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error)
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return
      }
    }

    recognition.onend = () => {
      const fullText = (accumulatedTextRef.current + interimTextRef.current).trim()
      if (fullText && isListeningRef.current) {
        onTranscriptRef.current(fullText)
        accumulatedTextRef.current = ''
        interimTextRef.current = ''
        setFinalTranscript('')
        setInterimTranscript('')
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }

      if (isListeningRef.current) {
        setTimeout(() => {
          try {
            recognition.start()
          } catch (e) {
            console.error('Failed to restart recognition:', e)
          }
        }, 100)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [resetSilenceTimer])

  useEffect(() => {
    if (!recognitionRef.current) return

    if (isListening && !disabled) {
      navigator.mediaDevices?.getUserMedia({ audio: true })
        .then(() => {
          try {
            recognitionRef.current?.start()
          } catch (e: any) {
            if (!e.message?.includes('already started')) {
              console.error('Failed to start:', e)
            }
          }
        })
        .catch((err) => {
          console.error('Mic permission denied:', err)
          alert('Microphone permission is required for voice input.')
        })
    } else {
      // Stop recognition and CLEAR all accumulated text
      // This prevents TTS audio from being included in user's transcript
      try {
        recognitionRef.current?.stop()
      } catch (e) {
        // Ignore
      }
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
        silenceTimerRef.current = null
      }
      // Clear any accumulated text when stopping
      accumulatedTextRef.current = ''
      interimTextRef.current = ''
      setFinalTranscript('')
      setInterimTranscript('')
    }
  }, [isListening, disabled])

  const toggleListening = async () => {
    if (disabled) return

    if (!isListening) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        setIsListening(true)
      } catch (err) {
        console.error('Microphone permission denied:', err)
        alert('Microphone permission is required.')
        return
      }
    } else {
      setIsListening(false)
    }
  }

  const displayText = finalTranscript || interimTranscript

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Microphone Button */}
      <div className="relative">
        {/* Pulse rings when listening */}
        {isListening && !disabled && (
          <>
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="absolute -inset-2 rounded-full bg-indigo-500/10 animate-pulse" />
          </>
        )}

        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`
            relative w-16 h-16 sm:w-20 sm:h-20 rounded-full
            flex items-center justify-center
            transition-all duration-300 ease-out
            ${disabled
              ? 'bg-slate-800 cursor-not-allowed opacity-50'
              : isListening
                ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50'
                : 'bg-slate-700 hover:bg-slate-600 hover:scale-105'
            }
          `}
          title={isListening ? 'Stop listening' : 'Start listening'}
        >
          {isListening ? (
            <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          ) : (
            <MicOff className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" />
          )}
        </button>
      </div>

      {/* Live Transcript */}
      {displayText && (
        <div className="w-full max-w-md glass-card-light rounded-xl p-4 animate-fade-in">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span>{finalTranscript}</span>
            <span className="text-slate-500 italic">{interimTranscript}</span>
          </p>
        </div>
      )}
    </div>
  )
}
