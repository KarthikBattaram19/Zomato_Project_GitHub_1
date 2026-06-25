from src.recommendation_engine import parse_recommendations

llm_output = """Here are your top restaurant recommendations for Whitefield:

1. **Flechazo**
Cuisine: North Indian
Rating: 4.9
Cost for Two: 1400.0
Explanation: Great place.

Enjoy your dining!"""

parsed = parse_recommendations(llm_output)
for p in parsed:
    print(p)
