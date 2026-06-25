import argparse
from datasets import load_dataset
import pandas as pd
import subprocess

def main():
    parser = argparse.ArgumentParser(description="Fetch top 5 rows from HuggingFace and display using read_parquet.py")
    parser.add_argument("--dataset", type=str, default="dair-ai/emotion", help="Hugging Face dataset name (default: dair-ai/emotion)")
    parser.add_argument("--split", type=str, default="train", help="Dataset split (default: train)")
    parser.add_argument("--output", type=str, default="hf_sample.parquet", help="Output parquet file (default: hf_sample.parquet)")
    
    args = parser.parse_args()
    
    print(f"Loading top 5 rows from Hugging Face dataset '{args.dataset}' (split: {args.split})...")
    try:
        # We use streaming=True so we don't download the entire dataset just for 5 rows
        dataset = load_dataset(args.dataset, split=args.split, streaming=True, trust_remote_code=True)
        top_5_rows = list(dataset.take(5))
        
        df = pd.DataFrame(top_5_rows)
        
        print(f"Saving to {args.output}...")
        df.to_parquet(args.output, engine='pyarrow')
        print("Save successful.\n")
        
        print("Invoking read_parquet.py visualizer...")
        subprocess.run(["python", "read_parquet.py", args.output])
        
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    main()
