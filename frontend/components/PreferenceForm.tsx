'use client'

import { useState } from 'react'
import type { UserPreferences } from '@/lib/types'
import SearchableDropdown from '@/components/ui/SearchableDropdown'
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown'

interface Props {
  locations: string[]
  cuisines: string[]
  prefs: UserPreferences
  onPrefsChange: (prefs: UserPreferences) => void
  loading: boolean
  optionsError: string | null
}

const BUDGET_OPTIONS = [
  { value: 'low',    label: 'Low',    sub: '≤ ₹500'      },
  { value: 'medium', label: 'Medium', sub: '₹500–₹1500'  },
  { value: 'high',   label: 'High',   sub: '₹1500+'      },
] as const

export default function PreferenceForm({
  locations,
  cuisines,
  prefs,
  onPrefsChange,
  loading,
  optionsError,
}: Props) {
  // Derived slider fill percentage
  const sliderPct = (prefs.minRating / 5) * 100

  function update<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    onPrefsChange({ ...prefs, [key]: value })
  }

  return (
    <div className="flex flex-col gap-5 px-5 py-5 flex-1">

      {/* API error banner */}
      {optionsError && (
        <div className="flex items-start gap-2 p-3 bg-error-container rounded-xl text-xs text-error">
          <span className="material-symbols-outlined text-[16px] flex-shrink-0 mt-0.5">warning</span>
          <span>
            Couldn&apos;t load options from the API. {optionsError} In Vercel, set{' '}
            <code className="font-mono">NEXT_PUBLIC_API_URL</code> to your Railway API URL and redeploy.
          </span>
        </div>
      )}

      {/* ── LOCATION ── */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">location_on</span>
          Location
        </label>
        <SearchableDropdown
          options={locations}
          value={prefs.location}
          onChange={v => update('location', v)}
          placeholder="Select a location…"
          disabled={loading}
        />
      </div>

      {/* ── BUDGET ── */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">payments</span>
          Budget
        </label>
        <div className="flex rounded-xl border border-outline-variant overflow-hidden text-sm font-medium">
          {BUDGET_OPTIONS.map((b, i) => (
            <button
              key={b.value}
              type="button"
              disabled={loading}
              onClick={() => update('budget', b.value)}
              className={`flex-1 py-2.5 text-center transition-colors disabled:opacity-50
                ${i < BUDGET_OPTIONS.length - 1 ? 'border-r border-outline-variant' : ''}
                ${prefs.budget === b.value
                  ? 'bg-on-surface text-white'
                  : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="block text-xs">{b.label}</span>
              <span className="text-[10px] opacity-70">{b.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CUISINE ── */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">restaurant</span>
          Cuisine
          <span className="normal-case font-normal text-on-surface-variant ml-1">(pick any)</span>
        </label>
        <MultiSelectDropdown
          options={cuisines}
          selected={prefs.cuisines}
          onChange={v => update('cuisines', v)}
          placeholder="Select cuisines…"
          disabled={loading}
        />
      </div>

      {/* ── MIN RATING SLIDER ── */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">star</span>
          Minimum Rating
        </label>
        <div className="relative px-1">
          {/* Floating badge */}
          <div className="relative h-7 mb-0.5">
            <span
              className="absolute bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full shadow
                         pointer-events-none -translate-x-1/2 whitespace-nowrap transition-all duration-100"
              style={{ left: `${sliderPct}%`, bottom: 0 }}
            >
              {prefs.minRating.toFixed(1)} ★
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={5}
            step={0.5}
            value={prefs.minRating}
            disabled={loading}
            onChange={e => update('minRating', parseFloat(e.target.value))}
            className="w-full cursor-pointer disabled:opacity-50"
            style={{ background: `linear-gradient(to right, #b7122a ${sliderPct}%, #e5e2e1 ${sliderPct}%)` }}
          />
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-1.5">
            {[0, 1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>
      </div>

      {/* ── ADDITIONAL PREFERENCES ── */}
      <div>
        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1.5">
          <span className="material-symbols-outlined text-[14px] align-middle mr-1">edit_note</span>
          Special Requests
        </label>
        <textarea
          rows={3}
          value={prefs.additionalPreferences}
          disabled={loading}
          onChange={e => update('additionalPreferences', e.target.value)}
          placeholder="e.g. family-friendly, outdoor seating, vegan options…"
          className="w-full px-3 py-2.5 rounded-xl border border-outline-variant bg-white text-sm text-on-surface
                     placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary/30
                     resize-none disabled:opacity-50"
        />
      </div>
    </div>
  )
}
