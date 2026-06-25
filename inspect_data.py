from src.data_loader import load_data

df = load_data()
print("Locations:")
print(df['location'].unique()[:10])
print("\nBudget tiers:")
print(df['budget_tier'].value_counts())
print("\nKoramangala 5th Block count:", sum(df['location'].str.lower() == 'koramangala 5th block'))
print("Whitefield count:", sum(df['location'].str.lower() == 'whitefield'))
