from src.data_loader import load_data
from src.filter_engine import filter_restaurants

df = load_data()
results = filter_restaurants(df, location="Whitefield", budget="low", cuisine="Italian", min_rating=5.0, top_n=5)
print(f"Returned {len(results)} restaurants")
print(results[["restaurant_name", "rating", "budget_tier"]])
