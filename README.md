# Zomato AI Restaurant Recommender

An AI-powered restaurant recommendation system for Bangalore. Set your location, budget, and cuisine preferences — the app filters real Zomato data, sends the best candidates to Llama 3 via Groq, and returns ranked recommendations with personalised explanations.

---

## Architecture

```
┌─────────────────────────┐        REST API        ┌──────────────────────────┐
│   Next.js Front-End     │ ─────────────────────► │   FastAPI Back-End       │
│   (Vercel)              │ ◄───────────────────── │   (Railway)              │
│                         │   JSON responses        │                          │
│  PreferenceForm         │                        │  /api/health             │
│  RestaurantCard         │                        │  /api/options            │
│  Results / Fallback UI  │                        │  /api/recommend          │
└─────────────────────────┘                        └──────────────────────────┘
                                                            │
                                              ┌─────────────┴────────────┐
                                              │   Python Pipeline        │
                                              │                          │
                                              │  data_loader.py          │
                                              │  filter_engine.py        │
                                              │  prompt_builder.py       │
                                              │  recommendation_engine.py│
                                              └──────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Back-end API | FastAPI + Uvicorn (Python 3.10+) |
| Front-end | Next.js 14 (App Router, TypeScript, Tailwind CSS) |
| Data | Pandas + Hugging Face Hub CSV download |
| LLM | Groq API — `llama-3.3-70b-versatile` |
| Back-end deploy | Railway |
| Front-end deploy | Vercel |
| Config | `python-dotenv` |

---

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)

---

### Back-End Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd Zomato_Project_1

# 2. Create and activate a virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Create the environment file
copy .env.example .env       # Windows
# cp .env.example .env       # macOS / Linux
```

Edit `.env` and add your key:

```
GROQ_API_KEY=your_actual_key_here
FRONTEND_ORIGIN=http://localhost:3000
```

```bash
# 5. Start the API server
python -m uvicorn src.main:app --reload --reload-dir src --port 8000
```

The API is now live at `http://localhost:8000`. Interactive docs: `http://localhost:8000/docs`.

---

### Front-End Setup

```bash
# In a separate terminal

# 1. Install Node dependencies
cd frontend
npm install

# 2. Create the local front-end env file
copy .env.example .env.local
# .env.local contains: NEXT_PUBLIC_API_URL=http://localhost:8000

# 3. Start the dev server
npm run dev
```

The UI is now live at `http://localhost:3000`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Readiness probe — returns `{ "status": "ok" }` |
| `GET` | `/api/options` | Unique locations and cuisines for dropdowns |
| `POST` | `/api/recommend` | Full pipeline: filter → LLM → structured results |

### `POST /api/recommend` — Request body

```json
{
  "location": "Koramangala 5th Block",
  "budget": "medium",
  "cuisine": "North Indian",
  "min_rating": 3.5,
  "additional_preferences": "outdoor seating",
  "top_n": 10
}
```

### `POST /api/recommend` — Response

```json
{
  "status": "ok",
  "recommendations": [
    {
      "rank": 1,
      "restaurant_name": "...",
      "cuisine": "...",
      "rating": "4.5",
      "cost_for_two": "₹1,200",
      "explanation": "..."
    }
  ],
  "fallback": null
}
```

**`status` values:**

| Value | Meaning |
|---|---|
| `ok` | LLM returned valid recommendations |
| `no_results` | No restaurants matched the filters |
| `missing_key` | `GROQ_API_KEY` is not configured |
| `llm_error` | Groq API call failed; `fallback` rows included |

---

## Project Structure

```
Zomato_Project_1/
├── src/                              # FastAPI back-end
│   ├── main.py                       # API entry point (3 endpoints)
│   ├── data_loader.py                # Hugging Face download, caching, cleaning
│   ├── filter_engine.py              # Filter chain with progressive relaxation
│   ├── prompt_builder.py             # LLM prompt construction
│   ├── recommendation_engine.py      # Groq API integration + response parsing
│   └── utils.py                      # Budget tier mapping, dropdown helpers
├── frontend/                         # Next.js front-end
│   ├── app/
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main page (form + results)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── PreferenceForm.tsx         # Location, budget, cuisine, rating inputs
│   │   ├── RestaurantCard.tsx         # Individual recommendation card
│   │   ├── Results.tsx               # All result states (loading, error, etc.)
│   │   └── ui/                       # Reusable UI primitives
│   ├── lib/
│   │   ├── api.ts                    # Typed API client (getOptions, getRecommendations)
│   │   └── types.ts                  # Shared TypeScript types
│   ├── .env.example                  # NEXT_PUBLIC_API_URL template
│   └── vercel.json                   # Vercel build config
├── data/                             # Cached dataset CSV (git-ignored)
├── Docs/                             # Architecture and planning documents
├── .env                              # Back-end secrets (git-ignored)
├── .env.example                      # Environment variable template
├── requirements.txt                  # Python dependencies
└── README.md
```

---

## Deployment

### Back-End → Railway

1. Push the repository to GitHub.
2. Create a new Railway project from the repo (root = repository root).
3. Railway reads the start command from `railpack.json`.
4. In Railway's **Variables** tab, import the suggested variables from `.env.example` or add them manually:
   - `GROQ_API_KEY` — your Groq API key
   - `FRONTEND_ORIGIN` — your Vercel deployment URL (set after front-end deploy)
   - `HF_TOKEN` — optional, but recommended to improve Hugging Face download limits
5. Deploy. Note the public Railway URL (e.g. `https://your-app.up.railway.app`).

### Front-End → Vercel

1. Import the same repository into Vercel.
2. Set the **Root Directory** to `frontend/`.
3. Add environment variable before deploying:
   - `NEXT_PUBLIC_API_URL` — the Railway URL from the step above
4. Deploy or redeploy the front-end so the value is baked into the Next.js build.
5. Copy the Vercel URL back into Railway's `FRONTEND_ORIGIN` and redeploy the back-end to update CORS.

### Smoke test (deployed)

```bash
curl https://your-app.up.railway.app/api/health
# Expected: {"status":"ok","data_status":"loading"|"ready","restaurants_loaded":...}
```

---

## License

This project is for educational purposes.
