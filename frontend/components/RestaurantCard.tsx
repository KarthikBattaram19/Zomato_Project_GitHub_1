'use client'

// 5B.7 — Restaurant recommendation card with restaurant ambiance images

import { useState } from 'react'
import type { Recommendation } from '@/lib/types'

/* ─── Restaurant → stable ambiance image ────────────────────── */
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
]

function buildUnsplashImageUrl(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?${UNSPLASH_PARAMS}`
}

function getRestaurantImageUrl(restaurantName: string): string {
  const hash = restaurantName
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0)
  return buildUnsplashImageUrl(RESTAURANT_IMAGE_IDS[hash % RESTAURANT_IMAGE_IDS.length])
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
}

export default function RestaurantCard({ rec, index }: Props) {
  const ratingNum  = parseFloat(rec.rating) || 0
  const cuisines   = rec.cuisine.split(',').map(c => c.trim()).filter(Boolean)
  const imgUrl     = getRestaurantImageUrl(rec.restaurant_name)

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
