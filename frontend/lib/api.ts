// 5B.2 — Typed API client for the FastAPI back-end
// Uses NEXT_PUBLIC_API_URL env variable; falls back to localhost:8000.

import type { OptionsResponse, RecommendRequest, RecommendResponse } from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * Fetch available locations and cuisines to populate the form dropdowns.
 * Corresponds to GET /api/options
 */
export async function getOptions(): Promise<OptionsResponse> {
  const res = await fetch(`${BASE_URL}/api/options`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load options: ${res.status}`)
  return res.json() as Promise<OptionsResponse>
}

/**
 * Request AI-powered restaurant recommendations from the pipeline.
 * Corresponds to POST /api/recommend
 */
export async function getRecommendations(req: RecommendRequest): Promise<RecommendResponse> {
  const res = await fetch(`${BASE_URL}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<RecommendResponse>
}
