import os
import json
import redis.asyncio as redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client = redis.from_url(REDIS_URL, decode_responses=True)

async def set_cache(key: str, value: dict, expire: int = 60):
    await redis_client.set(key, json.dumps(value), ex=expire)

async def get_cache(key: str):
    data = await redis_client.get(key)
    if data:
        return json.loads(data)
    return None

async def close_redis():
    await redis_client.aclose()
