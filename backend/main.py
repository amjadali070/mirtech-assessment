import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from cache import close_redis
from api.endpoints import router as api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: setup resources if needed
    yield
    # Shutdown: close redis
    await close_redis()

app = FastAPI(title="High-Performance Data Table API", lifespan=lifespan)

# Allow CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api", tags=["transactions"])

@app.get("/")
async def root():
    return {"message": "API is running. Access /api/transactions"}
