"""
main.py — FastAPI Back-End (Phase 5A)

Wraps the data, filter, prompt, and LLM pipeline behind a REST API.
Deployed on Railway; consumed by the Next.js front-end on Vercel.

Endpoints:
  GET  /api/health    — Railway readiness probe
  GET  /api/options   — Dropdown data (locations, cuisines)
  POST /api/recommend — Full recommendation pipeline
"""

import logging
import os
import threading
from contextlib import asynccontextmanager
from typing import Any

import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from src.data_loader import load_data
from src.filter_engine import filter_restaurants
from src.prompt_builder import SYSTEM_PROMPT, build_prompt
from src.recommendation_engine import get_recommendations, parse_recommendations
from src.utils import get_unique_cuisines, get_unique_locations

load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# In-memory data cache — loaded once at startup (5A.2)
# ---------------------------------------------------------------------------

_df: pd.DataFrame = pd.DataFrame()
_locations: list[str] = []
_cuisines: list[str] = []
_data_status = "not_loaded"
_data_error: str | None = None
_data_lock = threading.Lock()


def _load_dataset_once() -> None:
    """Load and cache restaurant data without blocking server startup."""
    global _df, _locations, _cuisines, _data_status, _data_error

    if _data_status == "ready":
        return

    with _data_lock:
        if _data_status == "ready":
            return

        _data_status = "loading"
        _data_error = None
        try:
            logger.info("Loading restaurant dataset...")
            df = load_data()
            _df = df
            _locations = get_unique_locations(_df)
            _cuisines = get_unique_cuisines(_df)
            _data_status = "ready"
            logger.info(
                f"Dataset ready — {len(_df)} restaurants, {len(_locations)} locations, {len(_cuisines)} cuisines."
            )
        except Exception as exc:
            _data_status = "error"
            _data_error = str(exc)
            logger.exception("Failed to load restaurant dataset.")


def _start_background_data_load() -> None:
    if os.getenv("PRELOAD_DATA_ON_STARTUP", "true").lower() in {"0", "false", "no"}:
        logger.info("Skipping background dataset preload.")
        return

    thread = threading.Thread(target=_load_dataset_once, name="dataset-loader", daemon=True)
    thread.start()


def _ensure_data_ready() -> None:
    _load_dataset_once()
    if _data_status != "ready":
        detail = "Restaurant dataset is not ready yet."
        if _data_error:
            detail = f"{detail} Last error: {_data_error}"
        raise HTTPException(status_code=503, detail=detail)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start quickly for Railway health checks, then warm the dataset cache."""
    _start_background_data_load()
    yield
    logger.info("Shutting down.")


# ---------------------------------------------------------------------------
# 5A.1 — FastAPI app + CORS
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Zomato AI Restaurant Recommender API",
    version="1.0.0",
    lifespan=lifespan,
)

# Build the CORS allow-list. FRONTEND_ORIGIN may be a single origin or a
# comma-separated list (e.g. "https://app.vercel.app,https://www.myapp.com").
# Local dev origins are always allowed, and any Vercel deployment URL is matched
# via regex so production + preview deployments work without reconfiguring.
_default_dev_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_configured_origins = [
    origin.strip().rstrip("/")
    for origin in os.getenv("FRONTEND_ORIGIN", "").split(",")
    if origin.strip()
]
_allowed_origins = list(dict.fromkeys(_configured_origins + _default_dev_origins))

logger.info(f"CORS allow-list: {_allowed_origins} (+ regex https://*.vercel.app)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_origin_regex=r"https://([a-z0-9-]+\.)*vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# 5A.3 — Pydantic request / response models
# ---------------------------------------------------------------------------

class RecommendRequest(BaseModel):
    location: str | None = Field(None, description="Bangalore neighbourhood, e.g. 'Koramangala 5th Block'")
    budget: str | None = Field(None, description="'low' | 'medium' | 'high'")
    cuisine: str | None = Field(None, description="Cuisine type, e.g. 'North Indian'")
    min_rating: float = Field(0.0, ge=0.0, le=5.0, description="Minimum acceptable rating")
    additional_preferences: str = Field("", description="Free-text user notes")
    top_n: int = Field(15, ge=1, le=50, description="Candidate pool size fed to the LLM")


class Recommendation(BaseModel):
    rank: int
    restaurant_name: str
    cuisine: str
    rating: str
    cost_for_two: str
    budget_tier: str
    explanation: str


class FallbackRow(BaseModel):
    restaurant_name: str
    location: str
    cuisines: str
    cost_for_two: float
    rating: float
    budget_tier: str


class RecommendResponse(BaseModel):
    status: str  # "ok" | "no_results" | "missing_key" | "llm_error"
    recommendations: list[Recommendation] = []
    fallback: list[FallbackRow] | None = None
    filters_relaxed: list[str] = []  # filters that were dropped, e.g. ["budget", "cuisine"]


# ---------------------------------------------------------------------------
# 5A.8 — Health endpoint
# ---------------------------------------------------------------------------

@app.get("/api/health", tags=["Meta"])
def health() -> dict[str, Any]:
    """Lightweight readiness probe for Railway."""
    return {
        "status": "ok",
        "data_status": _data_status,
        "restaurants_loaded": len(_df),
        "data_error": _data_error,
    }


# ---------------------------------------------------------------------------
# 5A.4 — Options endpoint (dropdown data)
# ---------------------------------------------------------------------------

@app.get("/api/options", tags=["Meta"])
def options() -> dict[str, list[str]]:
    """Return unique locations and cuisines to populate front-end dropdowns."""
    _ensure_data_ready()
    return {"locations": _locations, "cuisines": _cuisines}


# ---------------------------------------------------------------------------
# 5A.5 / 5A.6 / 5A.7 — Recommend endpoint
# ---------------------------------------------------------------------------

@app.post("/api/recommend", response_model=RecommendResponse, tags=["Recommendations"])
def recommend(req: RecommendRequest) -> RecommendResponse:
    """
    Full pipeline: filter → build prompt → call LLM → parse → return.

    Status values:
      ok           — LLM returned valid structured recommendations
      no_results   — filters produced 0 candidates (fallback rows included)
      missing_key  — GROQ_API_KEY not configured
      llm_error    — LLM call failed or returned unparseable output
    """
    _ensure_data_ready()

    # 5A.6 — API key guard before doing any work
    if not os.getenv("GROQ_API_KEY"):
        logger.warning("GROQ_API_KEY is not set.")
        return RecommendResponse(status="missing_key")

    # Filter candidates
    filtered, filters_relaxed = filter_restaurants(
        _df,
        location=req.location,
        budget=req.budget,
        cuisine=req.cuisine,
        min_rating=req.min_rating,
        top_n=req.top_n,
    )

    if filters_relaxed:
        logger.info(f"Filters relaxed: {filters_relaxed}")

    # 5A.7 — Build fallback rows from whatever the filter returned
    def _to_fallback(df: pd.DataFrame) -> list[FallbackRow]:
        return [
            FallbackRow(
                restaurant_name=str(r.get("restaurant_name", "")),
                location=str(r.get("location", "")),
                cuisines=str(r.get("cuisines", "")),
                cost_for_two=float(r.get("cost_for_two", 0)),
                rating=float(r.get("rating", 0)),
                budget_tier=str(r.get("budget_tier", "")),
            )
            for r in df.to_dict(orient="records")
        ]

    # 5A.6 — No candidates after filtering
    if filtered.empty:
        logger.info("No restaurants matched the given filters.")
        return RecommendResponse(status="no_results", fallback=[])

    fallback_rows = _to_fallback(filtered)

    # Build prompt and call LLM
    try:
        prompt = build_prompt(
            filtered,
            location=req.location,
            budget=req.budget,
            cuisine=req.cuisine,
            min_rating=req.min_rating,
            additional_preferences=req.additional_preferences,
        )
        raw_output = get_recommendations(prompt, SYSTEM_PROMPT)
    except ValueError as exc:
        # Missing API key raised inside get_recommendations
        logger.error(f"API key error: {exc}")
        return RecommendResponse(status="missing_key")
    except Exception as exc:
        # Rate-limit retries exhausted or network error
        logger.error(f"LLM call failed: {exc}")
        return RecommendResponse(status="llm_error", fallback=fallback_rows, filters_relaxed=filters_relaxed)

    # Parse structured output
    parsed = parse_recommendations(raw_output)

    if not parsed:
        logger.warning("LLM returned output that could not be parsed.")
        return RecommendResponse(status="llm_error", fallback=fallback_rows, filters_relaxed=filters_relaxed)

    rows_by_name = {
        str(row.get("restaurant_name", "")).strip().casefold(): row
        for row in filtered.to_dict(orient="records")
    }

    recommendations: list[Recommendation] = []
    for item in parsed:
        row = rows_by_name.get(str(item.get("restaurant_name", "")).strip().casefold())
        if row is None:
            logger.warning(f"Skipping LLM recommendation outside filtered results: {item.get('restaurant_name', '')}")
            continue

        recommendations.append(
            Recommendation(
                rank=len(recommendations) + 1,
                restaurant_name=str(row.get("restaurant_name", "")),
                cuisine=str(row.get("cuisines", "")),
                rating=f"{float(row.get('rating', 0)):.1f}",
                cost_for_two=f"{float(row.get('cost_for_two', 0)):,.0f}",
                budget_tier=str(row.get("budget_tier", "")),
                explanation=item.get("explanation", ""),
            )
        )

    if not recommendations:
        logger.warning("LLM returned recommendations that were not in the filtered dataset.")
        return RecommendResponse(status="llm_error", fallback=fallback_rows, filters_relaxed=filters_relaxed)

    return RecommendResponse(status="ok", recommendations=recommendations, filters_relaxed=filters_relaxed)
