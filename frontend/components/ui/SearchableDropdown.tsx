'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  options: string[]
  value: string | null
  onChange: (val: string | null) => void
  placeholder?: string
  disabled?: boolean
}

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
}: Props) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const containerRef      = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onOutsideClick)
    return () => document.removeEventListener('mousedown', onOutsideClick)
  }, [])

  function handleOpen() {
    if (disabled) return
    setOpen(o => !o)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  function handleSelect(opt: string) {
    onChange(opt)
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border
          bg-white text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
          ${disabled ? 'opacity-50 cursor-not-allowed border-outline-variant' : 'hover:border-primary border-outline-variant cursor-pointer'}`}
      >
        <span className={value ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
          {value ?? placeholder}
        </span>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : '' }}
        >
          expand_more
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-outline-variant shadow-raised">
          <div className="p-2 border-b border-outline-variant">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full px-3 py-1.5 rounded-lg border border-outline-variant text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-on-surface"
            />
          </div>
          <div className="custom-scrollbar max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors
                    ${value === opt
                      ? 'bg-primary/5 text-primary font-medium'
                      : 'text-on-surface hover:bg-surface-container-low'}`}
                >
                  {opt}
                </button>
              ))
            ) : (
              <p className="px-4 py-3 text-xs text-on-surface-variant">No matches found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
