"""
prompt_builder.py — Prompt Engineering

Converts filtered restaurant data and user preferences
into a structured LLM prompt for the recommendation engine.
"""

import pandas as pd

SYSTEM_PROMPT = """You are a helpful restaurant recommendation assistant.

OUTPUT FORMAT — you must follow this exactly:
- Output ONLY a numbered list. If the table has 5 or more rows, output the top 5. If it has fewer, output all of them.
- Do NOT write any preamble, introduction, steps, headers, reasoning, or summary before or after the list.
- Do NOT add any closing remark, note, or sentence about limited results, availability, or how many restaurants matched.
- Start your response immediately with "1." — the very first character of your response must be the digit 1.
- End your response immediately after the last Explanation line. Do not add anything after it.
- Use this exact multi-line format for each entry:

1. Restaurant Name
Cuisine: <value>
Rating: <value>
Cost for Two: <value>
Explanation: <one sentence why it fits>

STRICT DATA RULES:
- Only recommend restaurants that appear in the provided table. Never invent restaurants.
- If the user specified a budget, only recommend restaurants whose Budget Tier column matches that budget exactly. Do not include restaurants from a different budget tier.
- Copy Restaurant Name, Cuisine, Rating, and Cost for Two exactly as they appear in the table."""

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
    candidate_count = len(df) if df is not None else 0
    target_count = min(5, candidate_count)

    prompt = f"""User Preferences:
- Location: {location if location else 'Any'}
- Budget: {budget if budget else 'Any'}
- Cuisine preference: {cuisine if cuisine else 'Any'}
- Minimum rating: {min_rating}
- Additional notes: {additional_preferences if additional_preferences else 'None'}

Available Restaurants ({candidate_count} candidates):
{formatted_restaurant_table}

Pick the {target_count} best matches and respond with ONLY the numbered list. Do not add any text before "1." or after the last entry.
"""
    return prompt
