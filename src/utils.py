"""
utils.py — Shared Helpers

Utility functions used across modules, including budget tier
mapping, data validators, and dropdown option extractors.
"""

import logging
import pandas as pd

logger = logging.getLogger(__name__)


def assign_budget_tier(cost: float) -> str:
    """Map a cost-for-two value to a budget tier.

    Args:
        cost: Average cost for two people.

    Returns:
        "low" if cost <= 500,
        "medium" if cost <= 1500,
        "high" otherwise.
    """
    if cost <= 500:
        return "low"
    elif cost <= 1500:
        return "medium"
    else:
        return "high"

def get_unique_locations(df: pd.DataFrame) -> list[str]:
    """Extract a sorted list of unique locations from the DataFrame."""
    if df is None or df.empty or 'location' not in df.columns:
        return []
    locations = df['location'].dropna().unique().tolist()
    return sorted([str(loc) for loc in locations if str(loc).strip()])

def get_unique_cuisines(df: pd.DataFrame) -> list[str]:
    """Extract a sorted list of unique individual cuisines from the DataFrame."""
    if df is None or df.empty or 'cuisines' not in df.columns:
        return []
    
    unique_cuisines = set()
    for cuisine_str in df['cuisines'].dropna():
        # Cuisines are comma-separated
        parts = [c.strip() for c in str(cuisine_str).split(',')]
        for part in parts:
            if part:
                unique_cuisines.add(part)
                
    return sorted(list(unique_cuisines))
