import asyncio
import random
from faker import Faker
from database import AsyncSessionLocal, engine
from models import Transaction, Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

fake = Faker()

CATEGORIES = ["Electronics", "Clothing", "Home", "Sports", "Books", "Toys", "Health", "Automotive"]
STATUSES = ["completed", "pending", "failed"]

async def seed_data(total_records=100_000, batch_size=10_000):
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    logger.info(f"Seeding {total_records} records in batches of {batch_size}...")
    
    async with AsyncSessionLocal() as session:
        for i in range(0, total_records, batch_size):
            batch = []
            for _ in range(batch_size):
                record = Transaction(
                    user_id=random.randint(1, 10000),
                    product_name=fake.company() + " " + fake.word().capitalize(),
                    category=random.choice(CATEGORIES),
                    amount=round(random.uniform(5.0, 5000.0), 2),
                    status=random.choices(STATUSES, weights=[0.8, 0.15, 0.05])[0],
                    is_fraudulent=random.random() < 0.02,
                    created_at=fake.date_time_between(start_date="-1y", end_date="now")
                )
                batch.append(record)
            
            session.add_all(batch)
            await session.commit()
            logger.info(f"Inserted {i + batch_size} records...")

    logger.info("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
