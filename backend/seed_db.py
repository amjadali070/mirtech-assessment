import asyncio
import argparse
from scripts.seed import seed_data

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Database Seeder")
    parser.add_argument("--records", type=int, default=100000, help="Number of records to seed")
    args = parser.parse_args()
    
    asyncio.run(seed_data(total_records=args.records))
