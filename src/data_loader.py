"""
data_loader.py — Data Ingestion

Downloads, caches, cleans, and exposes the Zomato dataset
from Hugging Face as a standardized pandas DataFrame.
"""

import os
import logging
import pandas as pd
from huggingface_hub import hf_hub_download
from src.utils import assign_budget_tier

logger = logging.getLogger(__name__)

CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
CACHE_FILE = os.path.join(CACHE_DIR, "zomato_cached.csv")
DATASET_REPO_ID = "ManikaSaini/zomato-restaurant-recommendation"
DATASET_FILENAME = "zomato.csv"
RAW_COLUMNS = [
    "name",
    "location",
    "cuisines",
    "approx_cost(for two people)",
    "rate",
]
COLUMN_MAPPING = {
    "name": "restaurant_name",
    "location": "location",
    "cuisines": "cuisines",
    "approx_cost(for two people)": "cost_for_two",
    "rate": "rating",
}
CHUNK_SIZE = int(os.getenv("ZOMATO_CSV_CHUNK_SIZE", "5000"))

def _clean_cost(cost_str: str) -> float:
    """Helper to clean and convert cost to float."""
    if pd.isna(cost_str):
        return float('nan')
    try:
        # Remove any commas and non-numeric chars (keep digits and decimals)
        clean_str = ''.join(c for c in str(cost_str) if c.isdigit() or c == '.')
        return float(clean_str) if clean_str else float('nan')
    except (ValueError, TypeError):
        return float('nan')

def _clean_rating(rate_str: str) -> float:
    """Helper to clean and convert rating to float."""
    if pd.isna(rate_str):
        return float('nan')
    
    rate_str = str(rate_str).strip().upper()
    if rate_str in ("NEW", "-", "") or "NOT RATED" in rate_str:
        return float('nan')  # Unrated/new — treated as missing, not as 0
        
    try:
        # Example format: "4.1/5"
        val = rate_str.split('/')[0].strip()
        return float(val)
    except (ValueError, TypeError, IndexError):
        return float('nan')

def _normalize_cuisines(cuisine_str) -> str:
    """Normalize cuisines for consistent filtering (EC-7.2)."""
    if pd.isna(cuisine_str):
        return ""
    parts = [c.strip().title() for c in str(cuisine_str).split(',')]
    normalized = ", ".join(filter(None, parts))
    return normalized if normalized else ""


def _hf_token() -> str | None:
    token = os.getenv("HF_TOKEN", "").strip()
    if not token or token.startswith("your_"):
        return None
    return token


def _download_raw_data() -> pd.DataFrame:
    """Download only the columns needed by the API from the Hugging Face CSV."""
    logger.info("Downloading dataset CSV from Hugging Face Hub...")
    os.makedirs(CACHE_DIR, exist_ok=True)
    csv_path = hf_hub_download(
        repo_id=DATASET_REPO_ID,
        filename=DATASET_FILENAME,
        repo_type="dataset",
        local_dir=CACHE_DIR,
        token=_hf_token(),
    )

    chunks = pd.read_csv(
        csv_path,
        usecols=RAW_COLUMNS,
        chunksize=CHUNK_SIZE,
    )
    df = pd.concat(chunks, ignore_index=True)
    logger.info(f"Downloaded {len(df)} raw restaurant rows.")
    return df

def load_data() -> pd.DataFrame:
    """
    Load data from local cache if it exists, otherwise download from Hugging Face,
    clean it, and cache it.
    
    Returns:
        pd.DataFrame with standardized schema:
        restaurant_name, location, cuisines, cost_for_two, rating, budget_tier
    """
    df = None
    
    # Check cache first
    if os.path.exists(CACHE_FILE):
        try:
            df = pd.read_csv(CACHE_FILE)
            logger.info("Loaded dataset from local cache.")
            # EC-1.2 Check for corrupt/empty cache
            if df.empty or not {'restaurant_name', 'location', 'cuisines', 'cost_for_two', 'rating'}.issubset(set(df.columns)):
                logger.warning("Cache is empty or schema mismatched. Re-downloading...")
                df = None
        except Exception as e:
            logger.warning(f"Failed to read cache: {e}. Re-downloading...")
            df = None

    if df is None:
        try:
            df = _download_raw_data()
        except Exception as e:
            # EC-1.1 HF Dataset unavailable
            logger.error(f"Failed to download dataset from Hugging Face: {e}")
            if os.path.exists(CACHE_FILE):
                 df = pd.read_csv(CACHE_FILE)
                 logger.info("Fell back to reading dataset from local cache.")
            else:
                 raise RuntimeError("Unable to load restaurant data. Please check your internet connection and try again.")
        
        # EC-1.3 Handle schema changes by mapping columns
        # Rename columns that exist
        rename_dict = {old: new for old, new in COLUMN_MAPPING.items() if old in df.columns}
        df.rename(columns=rename_dict, inplace=True)
        
        # Ensure all expected columns are present
        missing_cols = set(COLUMN_MAPPING.values()) - set(df.columns)
        if missing_cols:
             raise ValueError(f"Required columns missing from dataset: {missing_cols}")

        # Extract only the needed columns
        df = df[['restaurant_name', 'location', 'cuisines', 'cost_for_two', 'rating']]

        # EC-1.6 Data cleaning and casting
        df['cost_for_two'] = df['cost_for_two'].apply(_clean_cost)
        df['rating'] = df['rating'].apply(_clean_rating)
        df['cuisines'] = df['cuisines'].apply(_normalize_cuisines)
        
        # Ensure correct types
        df['restaurant_name'] = df['restaurant_name'].astype(str)
        df['location'] = df['location'].astype(str)
        df['cuisines'] = df['cuisines'].astype(str)
        
        # EC-1.5 Treat empty-string cuisines as missing, then drop rows with any critical field null.
        # Rating NaN now includes genuinely unrated ("NEW"/"-") restaurants.
        df.replace('nan', float('nan'), inplace=True)
        df['cuisines'] = df['cuisines'].replace("", float('nan'))
        df.dropna(subset=['restaurant_name', 'location', 'cuisines', 'cost_for_two', 'rating'], inplace=True)

        # EC-1.7 Deduplicate by name and location, keeping highest rating
        df.sort_values('rating', ascending=False, inplace=True)
        df.drop_duplicates(subset=['restaurant_name', 'location'], keep='first', inplace=True)

        # 2.4 & 2.5 Add budget tier column
        df['budget_tier'] = df['cost_for_two'].apply(assign_budget_tier)

        # Cache the processed DataFrame
        os.makedirs(CACHE_DIR, exist_ok=True)
        df.to_csv(CACHE_FILE, index=False)
        logger.info(f"Dataset cached successfully to {CACHE_FILE}")

    return df
