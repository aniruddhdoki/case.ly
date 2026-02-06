import { Bot, Volume2 } from 'lucide-react'

interface AvatarPlaceholderProps {
  speaking: boolean
}

export default function AvatarPlaceholder({ speaking }: AvatarPlaceholderProps) {
  return (
    <div className="relative">
      {/* Outer glow rings */}
      {speaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl animate-pulse" />
        </>
      )}

      {/* Main avatar container */}
      <div
        className={`
          relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full
          bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500
          flex items-center justify-center
          shadow-2xl shadow-indigo-500/25
          transition-all duration-500
          ${speaking ? 'scale-105' : 'scale-100'}
        `}
      >
        {/* Inner circle */}
        <div className={`
          absolute inset-2 rounded-full bg-slate-900/90 backdrop-blur-sm
          flex items-center justify-center
          transition-all duration-300
        `}>
          {/* Icon */}
          <div className={`
            transition-all duration-300
            ${speaking ? 'text-indigo-400 scale-110' : 'text-slate-400'}
          `}>
            {speaking ? (
              <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
            ) : (
              <Bot className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16" />
            )}
          </div>
        </div>

        {/* Animated border when speaking */}
        {speaking && (
          <div className="absolute inset-0 rounded-full">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="1" />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="1" />
                </linearGradient>
              </defs>
              <circle
                cx="50%"
                cy="50%"
                r="48%"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="60 200"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className={`
        absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full
        flex items-center justify-center
        border-4 border-slate-900
        transition-colors duration-300
        ${speaking ? 'bg-indigo-500' : 'bg-slate-600'}
      `}>
        <span className={`
          w-2 h-2 rounded-full
          ${speaking ? 'bg-white animate-pulse' : 'bg-slate-400'}
        `} />
      </div>
    </div>
  )
}
