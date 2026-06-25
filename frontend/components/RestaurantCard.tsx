// 5B.7 — Restaurant recommendation card component

import type { Recommendation } from '@/lib/types'

interface Props {
  rec: Recommendation
  index: number
}

function ratingColorClass(r: number): string {
  if (r >= 4.0) return 'text-emerald-600 bg-emerald-50'
  if (r >= 3.0) return 'text-amber-500 bg-amber-50'
  return 'text-error bg-error-container'
}

export default function RestaurantCard({ rec, index }: Props) {
  const ratingNum = parseFloat(rec.rating) || 0
  const cuisines  = rec.cuisine.split(',').map(c => c.trim()).filter(Boolean)

  return (
    <div
      className="stagger-item bg-white rounded-xl p-4 shadow-resting hover:shadow-raised
                 transition-all duration-300 hover:-translate-y-0.5 relative group"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Rank badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center
                      text-white font-bold text-xs shadow-md group-hover:rotate-6 transition-transform duration-300">
        {rec.rank}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 ml-2 sm:ml-3">
        {/* Image / placeholder */}
        <div className="w-full sm:w-44 h-28 rounded-xl bg-surface-variant flex-shrink-0
                        flex items-center justify-center overflow-hidden">
          <span className="material-symbols-outlined text-on-surface-variant text-[40px]">
            restaurant
          </span>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Header row */}
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold text-on-surface mb-1">{rec.restaurant_name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {cuisines.map(c => (
                  <span key={c} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            {/* Favourite */}
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
              <span
                className="material-symbols-outlined text-[14px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
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
              <span
                className="material-symbols-outlined text-primary text-[18px] flex-shrink-0 mt-0.5"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              &ldquo;{rec.explanation}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
