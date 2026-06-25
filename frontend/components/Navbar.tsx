'use client'

import { useState } from 'react'

interface Props {
  onMobileFilterOpen: () => void
}

export default function Navbar({ onMobileFilterOpen }: Props) {
  const [isDark, setIsDark] = useState(false)

  function toggleDark() {
    setIsDark(d => !d)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 md:px-8
                    bg-surface dark:bg-inverse-surface border-b border-outline-variant dark:border-outline
                    h-16 shadow-resting">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#E23744"/>
          <path d="M12 10V18C12 20.2091 13.7909 22 16 22H18V28C18 29.1046 18.8954 30 20 30C21.1046 30 22 29.1046 22 28V22H24C26.2091 22 28 20.2091 28 18V10"
            stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 10V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 10V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M24 10V16" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M30 8L31.5 11L34.5 12.5L31.5 14L30 17L28.5 14L25.5 12.5L28.5 11L30 8Z" fill="#FFD700"/>
        </svg>
        <span className="text-xl font-bold text-primary dark:text-red-300">Zomato AI</span>
        <span className="hidden sm:inline text-xs font-medium text-on-surface-variant dark:text-gray-400
                         border border-outline-variant px-2 py-0.5 rounded-full">
          Powered by Llama 3 × Groq
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-5">
        <a href="#" className="hidden md:block text-sm text-on-surface-variant dark:text-gray-300 hover:text-primary transition-colors">
          How it works
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hidden md:flex items-center gap-1 text-sm text-on-surface-variant dark:text-gray-300 hover:text-primary transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.031 1.531 1.031.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.741 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
          </svg>
          GitHub
        </a>

        {/* Mobile filter toggle */}
        <button
          onClick={onMobileFilterOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant text-on-surface-variant"
          aria-label="Open filters"
        >
          <span className="material-symbols-outlined text-[20px]">tune</span>
        </button>

        {/* Dark mode */}
        <button
          onClick={toggleDark}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-variant dark:hover:bg-surface-container text-on-surface-variant"
          aria-label="Toggle dark mode"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>
      </div>
    </nav>
  )
}
