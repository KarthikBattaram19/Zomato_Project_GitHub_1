// Shared TypeScript types — mirrors the FastAPI Pydantic models in src/main.py

export interface OptionsResponse {
  locations: string[]
  cuisines: string[]
}

export interface RecommendRequest {
  location: string | null
  budget: string | null
  cuisine: string | null          // comma-joined when multiple cuisines selected
  min_rating: number
  additional_preferences: string
  top_n: number
}

export interface Recommendation {
  rank: number
  restaurant_name: string
  cuisine: string
  rating: string
  cost_for_two: string
  budget_tier: string
  explanation: string
}

export interface FallbackRow {
  restaurant_name: string
  location: string
  cuisines: string
  cost_for_two: number
  rating: number
  budget_tier: string
}

export interface RecommendResponse {
  status: 'ok' | 'no_results' | 'missing_key' | 'llm_error'
  recommendations: Recommendation[]
  fallback: FallbackRow[] | null
  filters_relaxed: string[]  // filters that were dropped, e.g. ["budget", "cuisine"]
}

// Front-end-specific types
export type AppStatus = 'welcome' | 'loading' | 'results' | 'no_results' | 'llm_error' | 'missing_key'

export interface UserPreferences {
  location: string | null
  budget: 'low' | 'medium' | 'high' | null
  cuisines: string[]
  minRating: number
  additionalPreferences: string
}
