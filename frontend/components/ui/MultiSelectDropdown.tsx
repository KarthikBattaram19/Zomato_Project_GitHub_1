'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  options: string[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  disabled?: boolean
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select…',
  disabled = false,
}: Props) {
  const [open, setOpen]   = useState(false)
  const [query, setQuery] = useState('')
  const containerRef      = useRef<HTMLDivElement>(null)
  const inputRef          = useRef<HTMLInputElement>(null)

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()))

  function toggle(opt: string) {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation()
    onChange([])
  }

  function removeTag(e: React.MouseEvent, opt: string) {
    e.stopPropagation()
    onChange(selected.filter(s => s !== opt))
  }

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

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full min-h-[42px] flex items-center justify-between gap-2 px-3 py-2 rounded-xl border
          bg-white text-sm text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30
          ${disabled ? 'opacity-50 cursor-not-allowed border-outline-variant' : 'hover:border-primary border-outline-variant cursor-pointer'}`}
      >
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-on-surface-variant">{placeholder}</span>
          ) : (
            selected.map(s => (
              <span
                key={s}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[11px] font-medium"
              >
                {s}
                <span
                  role="button"
                  aria-label={`Remove ${s}`}
                  className="cursor-pointer opacity-70 hover:opacity-100 leading-none text-sm"
                  onClick={(e) => removeTag(e, s)}
                >
                  ×
                </span>
              </span>
            ))
          )}
        </div>
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant flex-shrink-0 transition-transform"
          style={{ transform: open ? 'rotate(180deg)' : '' }}
        >
          expand_more
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-outline-variant shadow-raised">
          <div className="p-2 border-b border-outline-variant flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search cuisine…"
              className="flex-1 px-3 py-1.5 rounded-lg border border-outline-variant text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white text-on-surface"
            />
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-primary hover:underline whitespace-nowrap"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="custom-scrollbar max-h-52 overflow-y-auto py-1">
            {filtered.length > 0 ? (
              filtered.map(opt => {
                const checked = selected.includes(opt)
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggle(opt)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left
                      ${checked ? 'bg-primary/5' : 'hover:bg-surface-container-low'}`}
                  >
                    {/* Checkbox */}
                    <span
                      className={`w-4 h-4 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all
                        ${checked ? 'bg-primary border-primary' : 'border-outline-variant'}`}
                    >
                      {checked && (
                        <span
                          className="material-symbols-outlined text-white text-[11px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check
                        </span>
                      )}
                    </span>
                    <span className={checked ? 'text-on-surface font-medium' : 'text-on-surface-variant'}>
                      {opt}
                    </span>
                  </button>
                )
              })
            ) : (
              <p className="px-4 py-3 text-xs text-on-surface-variant">No cuisines found</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
