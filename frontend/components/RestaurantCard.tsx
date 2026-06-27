'use client'

// 5B.7 — Restaurant recommendation card with restaurant ambiance images

import { useState } from 'react'
import type { Recommendation } from '@/lib/types'

/* ─── Restaurant → ambiance image ───────────────────────────── */
const UNSPLASH_PARAMS = 'auto=format&fit=crop&w=480&h=320&q=80'
const RESTAURANT_IMAGE_IDS = [
  'photo-1517248135467-4c7edcad34c4',
  'photo-1552566626-52f8b828add9',
  'photo-1555396273-367ea4eb4db5',
  'photo-1514933651103-005eec06c04b',
  'photo-1559329007-40df8a9345d8',
  'photo-1521017432531-fbd92d768814',
  'photo-1414235077428-338989a2e8c0',
  'photo-1551218808-94e220e084d2',
  'photo-1466978913421-dad2ebd01d17',
  'photo-1504674900247-0877df9cc836',
  'photo-1424847651672-bf20a4b0982b',
  'photo-1540189549336-e6e99c3679fe',
  'photo-1467003909585-2f8a72700288',
  'photo-1432139509613-5c4255815697',
  'photo-1428515613728-6b4607e44363',
  'photo-1485921325833-c519f76c4927',
  'photo-1481833761820-0509d3217039',
  'photo-1473093295043-cdd812d0e601',
  'photo-1546069901-ba9599a7e63c',
  'photo-1565299624946-b28f40a0ae38',
]

function buildUnsplashImageUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`
}

/**
 * Assign a distinct image to every restaurant in a result set.
 *
 * Selecting purely by a name hash caused different restaurants to collide on
 * the same picture. Assigning by consecutive position guarantees uniqueness as
 * long as the list is no larger than the image pool, while a per-list seed
 * (derived from the names) keeps the same rank from always showing the same
 * image across different searches.
 */
export function buildRestaurantImageUrls(restaurantNames: string[]): string[] {
  const pool = RESTAURANT_IMAGE_IDS.length
  const seed = restaurantNames.reduce(
    (total, name) =>
      total + name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0),
    0,
  )
  return restaurantNames.map((_, index) =>
    buildUnsplashImageUrl(RESTAURANT_IMAGE_IDS[(seed + index) % pool]),
  )
}

/* ─── Rating colour helper ───────────────────────────────────── */
function ratingColorClass(r: number): string {
  if (r >= 4.0) return 'text-emerald-600 bg-emerald-50'
  if (r >= 3.0) return 'text-amber-500 bg-amber-50'
  return 'text-error bg-error-container'
}

/* ─── Component ──────────────────────────────────────────────── */
interface Props {
  rec: Recommendation
  index: number
  imageUrl: string
}

export default function RestaurantCard({ rec, index, imageUrl }: Props) {
  const ratingNum  = parseFloat(rec.rating) || 0
  const cuisines   = rec.cuisine.split(',').map(c => c.trim()).filter(Boolean)
  const imgUrl     = imageUrl

  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)

  return (
    <div
      className="stagger-item bg-white rounded-xl shadow-resting hover:shadow-raised
                 transition-all duration-300 hover:-translate-y-0.5 relative group overflow-hidden"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Rank badge */}
      <div className="absolute top-3 left-3 z-10 w-8 h-8 bg-primary rounded-full flex items-center justify-center
                      text-white font-bold text-xs shadow-md group-hover:rotate-6 transition-transform duration-300">
        {rec.rank}
      </div>

      <div className="flex flex-col sm:flex-row">

        {/* ── Image panel ──────────────────────────────────────── */}
        <div className="relative w-full sm:w-48 h-44 sm:h-auto flex-shrink-0 bg-surface-variant overflow-hidden">
          {/* Skeleton shimmer while loading */}
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 skeleton" />
          )}

          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={`${rec.restaurant_name} restaurant`}
              className={`w-full h-full object-cover transition-opacity duration-500
                          ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgError(true); setImgLoaded(true) }}
            />
          ) : (
            /* Fallback icon */
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-container">
              <span className="material-symbols-outlined text-on-surface-variant text-[48px]">restaurant</span>
              <span className="text-[10px] text-on-surface-variant font-medium">{cuisines[0]}</span>
            </div>
          )}

          {/* Gradient overlay at bottom of image for mobile */}
          {imgLoaded && !imgError && (
            <div className="absolute bottom-0 left-0 right-0 h-12 sm:hidden
                            bg-gradient-to-t from-black/40 to-transparent" />
          )}
        </div>

        {/* ── Content panel ────────────────────────────────────── */}
        <div className="flex-1 flex flex-col p-4">
          {/* Header row */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 pr-2">
              <h3 className="text-base font-semibold text-on-surface leading-tight mb-1.5">
                {rec.restaurant_name}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {cuisines.map(c => (
                  <span key={c}
                    className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            {/* Favourite button */}
            <button
              className="w-9 h-9 rounded-full bg-surface hover:bg-surface-variant border border-outline-variant
                         flex items-center justify-center text-on-surface-variant transition-colors flex-shrink-0"
              aria-label="Save restaurant"
            >
              <span className="material-symbols-outlined text-[18px]">favorite</span>
            </button>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mb-3 text-sm text-on-surface-variant">
            <span className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded ${ratingColorClass(ratingNum)}`}>
              <span className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
              {rec.rating}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">payments</span>
              ₹{rec.cost_for_two} for two
            </span>
          </div>

          {/* AI explanation */}
          <div className="mt-auto bg-[#FFF8F0] border-l-4 border-primary px-3 py-2.5 rounded-r-xl">
            <p className="text-sm italic text-on-surface-variant flex gap-2">
              <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              &ldquo;{rec.explanation}&rdquo;
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
