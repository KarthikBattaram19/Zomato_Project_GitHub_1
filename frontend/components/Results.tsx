// 5B.6 / 5B.8 / 5B.9 — All result states: welcome, loading, results, no_results, llm_error, missing_key

import type { AppStatus, FallbackRow, Recommendation } from '@/lib/types'
import RestaurantCard from './RestaurantCard'

interface Props {
  status: AppStatus
  recommendations: Recommendation[]
  fallback: FallbackRow[] | null
  filtersRelaxed: string[]
  onReset: () => void
}

/* ─── Skeleton placeholder card ─────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-resting">
      <div className="flex gap-4">
        <div className="skeleton w-44 h-28 flex-shrink-0 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2 pt-1">
          <div className="skeleton h-5 w-3/4 rounded" />
          <div className="skeleton h-3 w-1/3 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
          <div className="skeleton h-12 w-full rounded mt-auto" />
        </div>
      </div>
    </div>
  )
}

/* ─── Main component ─────────────────────────────────────────── */
export default function Results({ status, recommendations, fallback, filtersRelaxed, onReset }: Props) {

  /* Welcome */
  if (status === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-[48px]">restaurant_menu</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Tell us what you&apos;re craving</h2>
        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">
          Set your preferences in the sidebar and let our AI find the perfect dining experience — complete with personalised explanations.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2 text-xs text-on-surface-variant">
          {[
            { icon: 'location_on',   label: '92 Locations'    },
            { icon: 'restaurant',    label: '50+ Cuisines'    },
            { icon: 'auto_awesome',  label: 'Llama 3 Powered' },
          ].map(b => (
            <span key={b.label} className="flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-full">
              <span className="material-symbols-outlined text-[14px]">{b.icon}</span>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    )
  }

  /* Loading */
  if (status === 'loading') {
    return (
      <div>
        <div className="flex items-center gap-2 mb-6 px-4 py-2.5 bg-primary/5 border border-primary/20
                        rounded-full w-fit text-sm text-primary font-medium">
          <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
          AI is analysing restaurants for you…
        </div>
        <div className="flex flex-col gap-4 max-w-3xl">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    )
  }

  /* No results */
  if (status === 'no_results') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 mb-4 rounded-full bg-surface-container-highest flex items-center justify-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[40px]">no_meals</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">No exact matches found</h2>
        <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-5">
          We couldn&apos;t find restaurants matching all your filters. Try broadening your search — lower the rating or remove a cuisine filter.
        </p>
        <button
          onClick={onReset}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold
                     hover:bg-primary-container transition-colors"
        >
          Try Broader Search
        </button>
      </div>
    )
  }

  /* Missing API key */
  if (status === 'missing_key') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-20 h-20 mb-4 rounded-full bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-error text-[40px]">key_off</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface mb-2">Groq API Key Not Configured</h2>
        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed mb-2">
          Add your key to the back-end <code className="bg-surface-container px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file and restart the server:
        </p>
        <pre className="bg-surface-container-high text-on-surface text-xs font-mono px-4 py-3 rounded-xl text-left mt-2">
          GROQ_API_KEY=your_key_here
        </pre>
      </div>
    )
  }

  /* LLM error — show fallback table */
  if (status === 'llm_error') {
    return (
      <div>
        <div className="flex items-start gap-3 p-4 bg-error-container border border-error/30 rounded-xl mb-5 max-w-3xl">
          <span className="material-symbols-outlined text-error text-[22px] flex-shrink-0 mt-0.5">warning</span>
          <div>
            <p className="text-sm font-semibold text-error">Couldn&apos;t reach the AI engine</p>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Showing raw filtered results below. Check your API key or try again later.
            </p>
          </div>
        </div>
        {fallback && fallback.length > 0 && (
          <div className="bg-white rounded-xl shadow-resting overflow-hidden max-w-3xl">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-high text-on-surface-variant">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Restaurant</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Cuisine</th>
                  <th className="text-left px-4 py-3 font-semibold">Rating</th>
                  <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Cost for 2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {fallback.map((row, i) => (
                  <tr key={i} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{row.restaurant_name}</td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">{row.cuisines}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${
                        row.rating >= 4.0 ? 'text-emerald-600' :
                        row.rating >= 3.0 ? 'text-amber-500'   : 'text-error'
                      }`}>
                        ★ {row.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant hidden sm:table-cell">
                      ₹{row.cost_for_two.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }

  /* Results */
  return (
    <div className="flex flex-col gap-4 max-w-3xl">
      {recommendations.map((rec, i) => (
        <RestaurantCard key={rec.rank} rec={rec} index={i} />
      ))}
    </div>
  )
}
