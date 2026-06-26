"""
filter_engine.py — Data Filtering & Query

Accepts user preferences and returns a filtered, ranked
candidate list from the restaurant DataFrame.
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)

# Alias map for common Bangalore area name variants (EC-2.2).
# All dataset locations are Bangalore neighbourhoods.
LOCATION_ALIASES = {
    "koramangala": "koramangala 5th block",  # most common sub-area
    "indiranagar": "indiranagar",
    "mg road": "mg road",
    "brigade road": "brigade road",
    "whitefield": "whitefield",
    "jp nagar": "jp nagar",
    "jayanagar": "jayanagar",
    "btm layout": "btm",
    "btm 2nd stage": "btm",
    "hsr layout": "hsr layout",
    "electronic city": "electronic city phase 1",
}

def _normalize_location(loc: str) -> str:
    """Normalize location for case-insensitive matching and aliases."""
    loc = str(loc).strip().lower()
    return LOCATION_ALIASES.get(loc, loc)


def filter_restaurants(
    df: pd.DataFrame,
    location: str | None = None,
    budget: str | None = None,       # "low", "medium", "high"
    cuisine: str | None = None,
    min_rating: float = 0.0,
    top_n: int = 10
) -> tuple[pd.DataFrame, list[str]]:
    """
    Returns (dataframe, relaxed_filters) where relaxed_filters lists any filter
    names that were dropped to find results (e.g. ["budget", "cuisine"]).
    Implements progressive relaxation if 0 exact matches are found.
    """
    if df is None or df.empty:
        return pd.DataFrame(), []

    # Start with a copy to avoid SettingWithCopyWarning
    filtered_df = df.copy()

    # Apply Location Filter (EC-2.2)
    if location and str(location).strip():
        norm_target_loc = _normalize_location(location)
        mask = filtered_df['location'].apply(lambda x: _normalize_location(x) == norm_target_loc)
        filtered_df = filtered_df[mask]

    # Progressively relax if no results (EC-2.1)
    relaxed_filters: list[str] = []

    def apply_remaining_filters(current_df, include_budget=True, include_cuisine=True, rating_threshold=min_rating):
        temp_df = current_df.copy()

        if include_budget and budget and str(budget).strip():
            temp_df = temp_df[temp_df['budget_tier'] == str(budget).strip().lower()]
            if temp_df.empty:
                return current_df.iloc[0:0]  # empty with correct schema

        if include_cuisine and cuisine and str(cuisine).strip():
            if temp_df.empty:
                return current_df.iloc[0:0]
            # Support comma-separated multi-cuisine selections with OR logic (EC-2.3)
            search_terms = [t.strip().lower() for t in str(cuisine).split(',') if t.strip()]
            if search_terms:
                cuisines_lower = temp_df['cuisines'].str.lower()
                mask = cuisines_lower.apply(
                    lambda x: any(term in x for term in search_terms)
                )
                temp_df = temp_df[mask]
            if temp_df.empty:
                return current_df.iloc[0:0]

        temp_df = temp_df[temp_df['rating'] >= rating_threshold]
        return temp_df

    budget_selected = bool(budget and str(budget).strip())

    # First attempt: All filters
    final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=True, rating_threshold=min_rating)

    # EC-2.4: If min_rating is exactly 5.0 and no results, relax to 4.5
    if final_df.empty and min_rating == 5.0:
        logger.info("No 5.0 rating restaurants found. Relaxing rating to 4.5.")
        final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=True, rating_threshold=4.5)
        relaxed_filters.append("rating")

    # EC-2.1: Relaxation chain — try dropping cuisine first to preserve budget
    if final_df.empty and cuisine and str(cuisine).strip():
        logger.info("No exact matches. Dropping cuisine filter (keeping budget).")
        final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=False, rating_threshold=min_rating)
        relaxed_filters.append("cuisine")

    if final_df.empty and budget_selected and min_rating > 0:
        logger.info("Still no matches. Dropping rating filter (keeping budget).")
        final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=False, rating_threshold=0.1)
        if "rating" not in relaxed_filters:
            relaxed_filters.append("rating")

    if final_df.empty and not budget_selected:
        # Relax budget (cuisine already dropped or was not set)
        logger.info("No matches with budget. Dropping budget filter.")
        final_df = apply_remaining_filters(filtered_df, include_budget=False, include_cuisine=False, rating_threshold=min_rating)
        if "budget" not in relaxed_filters:
            relaxed_filters.append("budget")

    if final_df.empty and not budget_selected and min_rating > 0:
        logger.info("Still no matches. Dropping all non-location filters.")
        final_df = apply_remaining_filters(filtered_df, include_budget=False, include_cuisine=False, rating_threshold=0.1)

    # Sort results by rating descending
    final_df = final_df.sort_values(by='rating', ascending=False)

    # Truncate to top_n
    final_df = final_df.head(top_n)

    return final_df, relaxed_filters
