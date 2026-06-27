// 5B.2 — Typed API client for the FastAPI back-end
// Uses NEXT_PUBLIC_API_URL in production; local development may fall back to localhost.

import type { OptionsResponse, RecommendRequest, RecommendResponse } from './types'

const DEFAULT_LOCAL_API_URL = 'http://localhost:8000'

function getBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim()

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '')
  }

  if (process.env.NODE_ENV === 'development') {
    return DEFAULT_LOCAL_API_URL
  }

  throw new Error('NEXT_PUBLIC_API_URL is not configured. Set it in Vercel to the Railway API URL.')
}

/**
 * Fetch available locations and cuisines to populate the form dropdowns.
 * Corresponds to GET /api/options
 */
export async function getOptions(): Promise<OptionsResponse> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/options`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to load options: ${res.status}`)
  return res.json() as Promise<OptionsResponse>
}

/**
 * Request AI-powered restaurant recommendations from the pipeline.
 * Corresponds to POST /api/recommend
 */
export async function getRecommendations(req: RecommendRequest): Promise<RecommendResponse> {
  const baseUrl = getBaseUrl()
  const res = await fetch(`${baseUrl}/api/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json() as Promise<RecommendResponse>
}
