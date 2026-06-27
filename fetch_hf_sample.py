import argparse
import pandas as pd
import subprocess
from huggingface_hub import hf_hub_download

def main():
    parser = argparse.ArgumentParser(description="Fetch top 5 rows from a Hugging Face dataset CSV.")
    parser.add_argument(
        "--dataset",
        type=str,
        default="ManikaSaini/zomato-restaurant-recommendation",
        help="Hugging Face dataset repo id",
    )
    parser.add_argument("--filename", type=str, default="zomato.csv", help="CSV filename in the dataset repo")
    parser.add_argument("--output", type=str, default="hf_sample.parquet", help="Output parquet file (default: hf_sample.parquet)")
    
    args = parser.parse_args()
    
    print(f"Loading top 5 rows from Hugging Face dataset '{args.dataset}/{args.filename}'...")
    try:
        csv_path = hf_hub_download(repo_id=args.dataset, filename=args.filename, repo_type="dataset")
        df = pd.read_csv(csv_path, nrows=5)
        
        print(f"Saving to {args.output}...")
        df.to_parquet(args.output, engine='pyarrow')
        print("Save successful.\n")
        
        print("Invoking read_parquet.py visualizer...")
        subprocess.run(["python", "read_parquet.py", args.output])
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
