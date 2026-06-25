'use client'

// 5B.1 / 5B.5 — Main page: orchestrates layout, form state, and API calls

import { useCallback, useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import PreferenceForm from '@/components/PreferenceForm'
import Results from '@/components/Results'
import { getOptions, getRecommendations } from '@/lib/api'
import type {
  AppStatus,
  FallbackRow,
  Recommendation,
  UserPreferences,
} from '@/lib/types'

const DEFAULT_PREFS: UserPreferences = {
  location:               null,
  budget:                 'medium',
  cuisines:               [],
  minRating:              3.5,
  additionalPreferences:  '',
}

/* ─── Active filter chip ─────────────────────────────────────── */
function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary
                     bg-primary/10 text-primary text-xs font-medium">
      {label}
    </span>
  )
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function HomePage() {
  // Options loaded from /api/options
  const [locations, setLocations]       = useState<string[]>([])
  const [cuisines,  setCuisines]        = useState<string[]>([])
  const [optionsError, setOptionsError] = useState<string | null>(null)

  // Form state
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)

  // Result state
  const [appStatus,        setAppStatus]        = useState<AppStatus>('welcome')
  const [recommendations,  setRecommendations]  = useState<Recommendation[]>([])
  const [fallback,         setFallback]         = useState<FallbackRow[] | null>(null)
  const [activeFilters,    setActiveFilters]    = useState<UserPreferences | null>(null)

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // 5B.4 — Populate dropdowns on mount
  useEffect(() => {
    getOptions()
      .then(data => {
        setLocations(data.locations)
        setCuisines(data.cuisines)
      })
      .catch(() => setOptionsError('Could not connect to the back-end API.'))
  }, [])

  // 5B.5 — Submit preferences → call /api/recommend
  const handleSubmit = useCallback(async () => {
    if (!prefs.location) {
      alert('Please select a location first.')
      return
    }

    setAppStatus('loading')
    setSidebarOpen(false)
    setActiveFilters({ ...prefs })

    try {
      const res = await getRecommendations({
        location:               prefs.location,
        budget:                 prefs.budget,
        cuisine:                prefs.cuisines.length > 0 ? prefs.cuisines.join(', ') : null,
        min_rating:             prefs.minRating,
        additional_preferences: prefs.additionalPreferences,
        top_n:                  10,
      })

      setFallback(res.fallback ?? null)

      if (res.status === 'ok') {
        setRecommendations(res.recommendations)
        setAppStatus('results')
      } else {
        setRecommendations([])
        setAppStatus(res.status as AppStatus)
      }
    } catch {
      setAppStatus('llm_error')
      setRecommendations([])
    }
  }, [prefs])

  function handleReset() {
    setPrefs(DEFAULT_PREFS)
    setAppStatus('welcome')
    setRecommendations([])
    setFallback(null)
    setActiveFilters(null)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#1a1a1a]">
      <Navbar onMobileFilterOpen={() => setSidebarOpen(true)} />

      <div className="flex pt-16 min-h-screen">

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-[320px] flex flex-col overflow-y-auto
            bg-surface-bright dark:bg-inverse-surface border-r border-outline-variant
            z-40 transition-transform duration-300 shadow-raised md:shadow-none
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
        >
          {/* Header */}
          <div className="px-5 pt-6 pb-4 border-b border-outline-variant dark:border-outline">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-primary text-[22px]">robot_2</span>
              </div>
              <div>
                <h2 className="text-base font-semibold text-on-surface dark:text-inverse-on-surface">
                  Find Your Perfect Restaurant
                </h2>
                <p className="text-xs text-on-surface-variant">AI-Powered Discovery</p>
              </div>
            </div>
          </div>

          {/* 5B.3 — Preference form */}
          <PreferenceForm
            locations={locations}
            cuisines={cuisines}
            prefs={prefs}
            onPrefsChange={setPrefs}
            loading={appStatus === 'loading'}
            optionsError={optionsError}
          />

          {/* CTA */}
          <div className="px-5 pb-6 pt-2 border-t border-outline-variant">
            <button
              onClick={handleSubmit}
              disabled={appStatus === 'loading'}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white
                         text-sm font-semibold hover:bg-primary-container active:scale-95
                         disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <span className={`material-symbols-outlined text-[18px] ${appStatus === 'loading' ? 'animate-spin' : ''}`}>
                {appStatus === 'loading' ? 'autorenew' : 'search'}
              </span>
              {appStatus === 'loading' ? 'Finding best matches…' : 'Find Restaurants'}
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="flex-1 ml-0 md:ml-[320px] px-4 md:px-8 py-6 min-h-screen">

          {/* Results header + active filter chips */}
          {appStatus === 'results' && activeFilters && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
              <h1 className="text-2xl md:text-3xl font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                <span>✨</span> Top Recommendations
              </h1>
              <div className="flex flex-wrap gap-2">
                {activeFilters.location && <FilterChip label={activeFilters.location} />}
                {activeFilters.budget   && (
                  <FilterChip
                    label={`${activeFilters.budget.charAt(0).toUpperCase() + activeFilters.budget.slice(1)} Budget`}
                  />
                )}
                {activeFilters.cuisines.map(c => <FilterChip key={c} label={c} />)}
                <FilterChip label={`≥ ${activeFilters.minRating.toFixed(1)}★`} />
              </div>
            </div>
          )}

          {/* 5B.6 / 5B.7 / 5B.8 / 5B.9 — Result states */}
          <Results
            status={appStatus}
            recommendations={recommendations}
            fallback={fallback}
            onReset={handleReset}
          />
        </main>
      </div>
    </div>
  )
}
