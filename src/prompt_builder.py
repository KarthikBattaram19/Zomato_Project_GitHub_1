"""
prompt_builder.py — Prompt Engineering

Converts filtered restaurant data and user preferences
into a structured LLM prompt for the recommendation engine.
"""

import pandas as pd

SYSTEM_PROMPT = """You are a friendly and knowledgeable restaurant recommendation assistant.
Given a list of restaurants and a user's preferences, rank the top
recommendations and explain why each one is a great fit."""

def _format_restaurant_table(df: pd.DataFrame) -> str:
    """Format candidate restaurants as a readable markdown table inside the prompt."""
    if df is None or df.empty:
        return "No restaurants available."
    
    table = "| Name | Location | Cuisines | Cost for Two | Rating | Budget Tier |\n"
    table += "|---|---|---|---|---|---|\n"
    
    for _, row in df.iterrows():
        table += f"| {row.get('restaurant_name', '')} | {row.get('location', '')} | {row.get('cuisines', '')} | {row.get('cost_for_two', '')} | {row.get('rating', '')} | {row.get('budget_tier', '')} |\n"
        
    return table

def build_prompt(
    df: pd.DataFrame,
    location: str | None = None,
    budget: str | None = None,
    cuisine: str | None = None,
    min_rating: float = 0.0,
    additional_preferences: str = ""
) -> str:
    """
    Convert user preferences + filtered DataFrame into a structured user prompt.
    """
    formatted_restaurant_table = _format_restaurant_table(df)
    
    prompt = f"""## User Preferences
- Location: {location if location else 'Any'}
- Budget: {budget if budget else 'Any'}
- Cuisine preference: {cuisine if cuisine else 'Any'}
- Minimum rating: {min_rating}
- Additional notes: {additional_preferences if additional_preferences else 'None'}

## Available Restaurants
{formatted_restaurant_table}

## Instructions
1. Rank the top 5 restaurants that best match.
2. For each recommendation, strictly use the following multi-line format:
[Rank]. [Name]
Cuisine: [Cuisine]
Rating: [Rating]
Cost for Two: [Cost]
Explanation: [Explanation]
"""
    return prompt
