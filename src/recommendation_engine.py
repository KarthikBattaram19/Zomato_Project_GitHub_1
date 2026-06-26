"""
recommendation_engine.py — LLM Integration

Sends constructed prompts to the Groq API (Llama 3) and
returns parsed, structured restaurant recommendations.
"""

import os
import time
import logging
import re
from typing import List, Dict, Any
from dotenv import load_dotenv
from groq import Groq
import groq

# Load environment variables
load_dotenv()
logger = logging.getLogger(__name__)

def get_recommendations(prompt: str, system_prompt: str) -> str:
    """
    Call Groq API with llama-3.3-70b-versatile.
    Implements rate-limit retry (exponential backoff, max 3) and empty response fallback.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is missing. Please check your .env file.")

    client = Groq(api_key=api_key)
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt},
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
                max_tokens=2048,
            )
            content = chat_completion.choices[0].message.content
            if not content:
                logger.warning("Received empty response from LLM.")
                return ""
            return content
        except groq.RateLimitError as e:
            if attempt < max_retries - 1:
                sleep_time = 2 ** attempt
                logger.warning(f"Rate limited. Retrying in {sleep_time} seconds...")
                time.sleep(sleep_time)
            else:
                logger.error("Max retries exceeded for Groq API Rate Limit.")
                raise e
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            raise e

    return ""

# Patterns that indicate a block is LLM preamble/reasoning rather than a restaurant entry
_PREAMBLE_PATTERNS = re.compile(
    r'^(#+\s|step\s*\d|here\s+are|based\s+on|filter|the\s+following|below\s+are|sure[,!]|of\s+course'
    r'|no\s+other|unfortunately|only\s+one|note\s*:|please\s+note|there\s+(are|is)\s+(no|only))',
    re.IGNORECASE,
)

# Patterns to strip from the tail of an explanation when the LLM adds closing remarks
_EXPLANATION_TAIL_PATTERNS = re.compile(
    r'\s*(No other recommendations?\s+(?:are|is)\s+available[^.]*\.|'
    r'Unfortunately[^.]*only\s+one[^.]*\.|'
    r'Note[:\s]+[^.]*only[^.]*\.|'
    r'Please note[^.]*\.|'
    r'Only\s+\d+\s+restaurant[^.]*\.|'
    r'There (?:are|is) (?:no|only)[^.]*\.)\s*$',
    re.IGNORECASE,
)

def parse_recommendations(llm_output: str) -> List[Dict[str, Any]]:
    """
    Parse LLM text output into a structured list of restaurant dictionaries.
    Skips any preamble, markdown headers, or reasoning blocks the LLM may emit
    before the numbered list.
    """
    recommendations = []

    if not llm_output:
        return recommendations

    # Split on numbered list markers: "1. ", "2.", "3) ", etc.
    blocks = re.split(r'\n\s*\d+[\.\)]\s*', '\n' + llm_output)

    for block in blocks:
        block = block.strip()
        if not block:
            continue

        lines = block.split('\n')
        name_line = lines[0].strip().replace('**', '').strip('#').strip()

        # Skip blocks that are clearly preamble / reasoning, not restaurant names
        if not name_line:
            continue
        if _PREAMBLE_PATTERNS.match(name_line):
            logger.debug(f"Skipping preamble block: {name_line[:60]!r}")
            continue
        # A restaurant name should not be very long or contain colons mid-line
        if len(name_line) > 120 or name_line.count(':') > 1:
            continue

        cuisine = ""
        rating = ""
        cost = ""
        explanation = ""

        for line in lines[1:]:
            line_clean = line.replace('**', '').strip()
            line_lower = line_clean.lower()

            if line_lower.startswith("cuisine") and ":" in line_clean:
                cuisine = line_clean.split(":", 1)[-1].strip()
            elif line_lower.startswith("rating") and ":" in line_clean:
                rating = line_clean.split(":", 1)[-1].strip()
            elif line_lower.startswith("cost") and ":" in line_clean:
                cost = line_clean.split(":", 1)[-1].strip()
            elif (line_lower.startswith("explanation") or line_lower.startswith("why")) and ":" in line_clean:
                explanation = line_clean.split(":", 1)[-1].strip()
            else:
                if explanation and line_clean:
                    explanation += " " + line_clean
                elif not (cuisine or rating or cost) and line_clean:
                    explanation += " " + line_clean

        # Only accept blocks that have at least a name plus one structured field
        if name_line and (cuisine or rating or cost):
            # Strip any trailing "no other recommendations" boilerplate the LLM may append
            clean_explanation = _EXPLANATION_TAIL_PATTERNS.sub("", explanation).strip()
            recommendations.append({
                "restaurant_name": name_line,
                "cuisine": cuisine,
                "rating": rating,
                "cost_for_two": cost,
                "explanation": clean_explanation,
            })

    return recommendations
