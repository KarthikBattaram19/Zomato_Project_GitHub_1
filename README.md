# 🍽️ Zomato AI Restaurant Recommender

An AI-powered restaurant recommendation system that suggests restaurants based on your preferences using real Zomato data and Groq's Llama 3 LLM.

## Features

- 📍 Filter by location, budget, cuisine, and rating
- 🤖 AI-generated personalized recommendations with explanations
- ⚡ Ultra-fast inference powered by Groq API
- 🎯 Smart fallback when exact matches aren't found

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Python 3.10+ |
| UI | Streamlit |
| Data | Pandas + Hugging Face Datasets |
| LLM | Groq API (Llama 3) |
| Config | python-dotenv |

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd Zomato_Project_1
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and add your Groq API key:

```
GROQ_API_KEY=your_actual_api_key_here
```

> 🔑 Get a free API key at [console.groq.com](https://console.groq.com)

### 5. Run the app

```bash
streamlit run src/app.py
```

## Project Structure

```
Zomato_Project_1/
├── Docs/                        # Documentation
│   ├── Problem_Statement_1.txt
│   ├── context_1.md
│   ├── architecture_1.md
│   ├── implementation-plan_1.md
│   └── edge-case_1.md
├── src/                         # Source code
│   ├── app.py                   # Streamlit entry point
│   ├── data_loader.py           # Dataset download & preprocessing
│   ├── filter_engine.py         # Query & filter logic
│   ├── prompt_builder.py        # LLM prompt construction
│   ├── recommendation_engine.py # Groq API integration
│   └── utils.py                 # Shared helpers
├── data/                        # Cached dataset (git-ignored)
├── .env                         # API keys (git-ignored)
├── .env.example                 # Environment template
├── .gitignore
├── requirements.txt
└── README.md
```

## License

This project is for educational purposes.
