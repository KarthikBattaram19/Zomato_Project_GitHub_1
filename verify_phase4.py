from src.data_loader import load_data
from src.filter_engine import filter_restaurants
from src.prompt_builder import build_prompt, SYSTEM_PROMPT
from src.recommendation_engine import get_recommendations, parse_recommendations

df = load_data()
filtered = filter_restaurants(df, location="Whitefield", budget="medium", top_n=10)
prompt = build_prompt(filtered, location="Whitefield", budget="medium", cuisine="Indian", min_rating=3.5)

print("Prompt snippet:")
print(prompt[:500] + "...")

try:
    response = get_recommendations(prompt, SYSTEM_PROMPT)
    assert len(response) > 0
    print("LLM returned recommendations successfully!")
    print("\nRaw Output:")
    print(response[:500] + "...")
    
    parsed = parse_recommendations(response)
    print(f"\nParsed {len(parsed)} recommendations:")
    for p in parsed:
        print(f"\n- {p['restaurant_name']}")
        print(f"  Cuisine: {p['cuisine']}")
        print(f"  Rating: {p['rating']}")
        print(f"  Cost for Two: {p['cost_for_two']}")
        print(f"  Explanation: {p['explanation']}")
except Exception as e:
    print(f"Failed to get recommendations: {e}")
