
import React from 'react'

export const Logo = () => {
  return (
    <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mb-4 shadow-lg relative overflow-hidden">
            {/* AI Circuit Pattern Background */}
            <div className="absolute inset-0 opacity-20">
              <svg className="w-full h-full" viewBox="0 0 80 80" fill="none">
                <circle cx="20" cy="20" r="2" fill="white"/>
                <circle cx="60" cy="20" r="2" fill="white"/>
                <circle cx="40" cy="40" r="3" fill="white"/>
                <circle cx="20" cy="60" r="2" fill="white"/>
                <circle cx="60" cy="60" r="2" fill="white"/>
                <line x1="20" y1="20" x2="38" y2="38" stroke="white" strokeWidth="1"/>
                <line x1="60" y1="20" x2="42" y2="38" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="43" x2="20" y2="60" stroke="white" strokeWidth="1"/>
                <line x1="40" y1="43" x2="60" y2="60" stroke="white" strokeWidth="1"/>
              </svg>
            </div>
            {/* Main Logo */}
            <div className="relative z-10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white" viewBox="0 0 32 32" fill="currentColor">
                {/* Plate */}
                <circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" strokeWidth="2"/>
                <circle cx="16" cy="16" r="10" fill="none" stroke="currentColor" strokeWidth="1"/>
                {/* Food sections with AI nodes */}
                <path d="M16 6 L24 12 L20 16 L16 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M24 12 L26 20 L20 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M26 20 L16 26 L20 16 Z" fill="currentColor" opacity="0.6"/>
                <path d="M16 26 L8 20 L16 16 L20 16 Z" fill="currentColor" opacity="0.7"/>
                <path d="M8 20 L6 12 L16 16 Z" fill="currentColor" opacity="0.5"/>
                <path d="M6 12 L16 6 L16 16 Z" fill="currentColor" opacity="0.6"/>
                {/* AI Brain center */}
                <circle cx="16" cy="16" r="3" fill="white"/>
                <circle cx="14" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="18" cy="14" r="0.5" fill="currentColor"/>
                <circle cx="16" cy="18" r="0.5" fill="currentColor"/>
              </svg>
            </div>
          </div></div>
  )
}


