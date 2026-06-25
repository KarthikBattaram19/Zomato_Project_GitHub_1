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
                temperature=0.7,
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

def parse_recommendations(llm_output: str) -> List[Dict[str, Any]]:
    """
    Parse LLM text output into a structured list of dictionaries.
    """
    recommendations = []
    
    if not llm_output:
        return recommendations
        
    # Split the output by numbered list items (e.g., "1. ", "2.", "1)")
    blocks = re.split(r'\n\s*\d+[\.\)]\s*', '\n' + llm_output)
    
    for block in blocks:
        block = block.strip()
        if not block:
            continue
            
        lines = block.split('\n')
        
        # The first line is typically the restaurant name
        name_line = lines[0].strip().replace('**', '')
        
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
                # If we found an explanation field previously, append extra text to it
                if explanation and line_clean:
                    explanation += " " + line_clean
                elif not (cuisine or rating or cost) and line_clean:
                    # Collect stray text into explanation if no structured fields are found
                    explanation += " " + line_clean

        if name_line and len(name_line) < 150 and (cuisine or rating or cost or explanation):
            recommendations.append({
                "restaurant_name": name_line,
                "cuisine": cuisine,
                "rating": rating,
                "cost_for_two": cost,
                "explanation": explanation.strip()
            })
            
    return recommendations
