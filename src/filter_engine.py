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
) -> pd.DataFrame:
    """
    Returns up to top_n restaurants matching all provided filters.
    Implements progressive relaxation if 0 exact matches are found.
    """
    if df is None or df.empty:
        return pd.DataFrame()

    # Start with a copy to avoid SettingWithCopyWarning
    filtered_df = df.copy()

    # Apply Location Filter (EC-2.2)
    if location and str(location).strip():
        norm_target_loc = _normalize_location(location)
        # Assuming df['location'] has string locations
        mask = filtered_df['location'].apply(lambda x: _normalize_location(x) == norm_target_loc)
        filtered_df = filtered_df[mask]

    # Progressively relax if no results (EC-2.1)
    relaxed_budget = False
    relaxed_cuisine = False
    relaxed_rating = False

    def apply_remaining_filters(current_df, include_budget=True, include_cuisine=True, rating_threshold=min_rating):
        temp_df = current_df.copy()
        
        if include_budget and budget and str(budget).strip():
            temp_df = temp_df[temp_df['budget_tier'] == str(budget).strip().lower()]
            
        if include_cuisine and cuisine and str(cuisine).strip():
            # Use case-insensitive substring matching for cuisines (EC-2.3)
            search_term = str(cuisine).strip().lower()
            temp_df = temp_df[temp_df['cuisines'].str.lower().str.contains(search_term, na=False, regex=False)]
            
        temp_df = temp_df[temp_df['rating'] >= rating_threshold]
        return temp_df

    # First attempt: All filters
    final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=True, rating_threshold=min_rating)

    # EC-2.4: If min_rating is exactly 5.0 and no results, relax to 4.5
    if final_df.empty and min_rating == 5.0:
        logger.info("No 5.0 rating restaurants found. Relaxing rating to 4.5.")
        final_df = apply_remaining_filters(filtered_df, include_budget=True, include_cuisine=True, rating_threshold=4.5)
        relaxed_rating = True

    # EC-2.1: Relaxation chain
    if final_df.empty:
        # Relax 1: Drop budget
        logger.info("No exact matches found. Dropping budget filter.")
        final_df = apply_remaining_filters(filtered_df, include_budget=False, include_cuisine=True, rating_threshold=min_rating)
        relaxed_budget = True

    if final_df.empty:
        # Relax 2: Drop cuisine (keep budget dropped)
        logger.info("Still no matches. Dropping cuisine filter.")
        final_df = apply_remaining_filters(filtered_df, include_budget=False, include_cuisine=False, rating_threshold=min_rating)
        relaxed_cuisine = True
        
    if final_df.empty and min_rating > 0:
         # Relax 3: Drop everything except location and positive ratings, sort by rating
         logger.info("Still no matches. Dropping all non-location filters.")
         final_df = apply_remaining_filters(filtered_df, include_budget=False, include_cuisine=False, rating_threshold=0.1)

    # Note: we might want to return the relaxation flags to the UI in the future
    # for now we log them.

    # Sort results by rating descending
    final_df = final_df.sort_values(by='rating', ascending=False)

    # Truncate to top_n (EC-3.1 safety limit logic is also helped here)
    final_df = final_df.head(top_n)
    
    return final_df
