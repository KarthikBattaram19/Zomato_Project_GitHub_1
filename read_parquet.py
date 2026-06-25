import argparse
import pandas as pd
import os

def read_and_display_parquet(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    print(f"Reading Parquet file from: {file_path}")
    print("-" * 50)
    
    try:
        # Read the parquet file
        df = pd.read_parquet(file_path)
        
        # Display basic information
        print(f"Total Rows: {len(df)}")
        print(f"Total Columns: {len(df.columns)}")
        print("\nColumn Names:")
        print(", ".join(df.columns))
        
        print("-" * 50)
        print("Data Preview (First 5 rows):")
        print(df.head())
        print("-" * 50)
        
    except Exception as e:
        print(f"Error reading the Parquet file: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Utility script to read and preview Parquet files.")
    
    # Default to the previously generated artifact path if no argument is provided
    default_path = r"C:\Users\Karthik Battaram\.gemini\antigravity-ide\brain\b6f693bf-75d7-4811-8aeb-4cb81164eae7\dataset_preview.parquet"
    
    parser.add_argument(
        "file_path", 
        nargs="?", 
        default=default_path,
        help="Path to the Parquet file you want to read. Defaults to the previously generated dataset preview."
    )
    
    args = parser.parse_args()
    read_and_display_parquet(args.file_path)
