from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, asc
from typing import List, Optional
import json
from datetime import datetime

from database import get_db
from models import Transaction
from schemas import TransactionResponse
from cache import get_cache, set_cache

router = APIRouter()

# Helper for datetime serialization
def json_serial(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

@router.get("/transactions", response_model=dict)
async def get_transactions(
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=1000),
    search: Optional[str] = None,
    sort_by: Optional[str] = "created_at",
    sort_desc: bool = True,
    category: Optional[str] = None,
    status: Optional[str] = None,
):
    # Create a unique cache key based on query parameters
    cache_key = f"tx:p{page}:l{limit}:s{search}:srt{sort_by}:d{sort_desc}:c{category}:st{status}"
    
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data

    # Base query
    query = select(Transaction)
    
    # Filtering
    filters = []
    if search:
        filters.append(Transaction.product_name.ilike(f"%{search}%"))
    if category:
        filters.append(Transaction.category == category)
    if status:
        filters.append(Transaction.status == status)
        
    if filters:
        query = query.where(and_(*filters))

    # Sorting
    if sort_by and hasattr(Transaction, sort_by):
        column = getattr(Transaction, sort_by)
        query = query.order_by(desc(column) if sort_desc else asc(column))

    # Pagination
    offset = (page - 1) * limit
    paginated_query = query.offset(offset).limit(limit)

    # Get total count (optimized with select count(*) from query)
    count_query = select(func.count()).select_from(query.subquery())
    
    # Execute queries
    total_result = await db.execute(count_query)
    total_count = total_result.scalar() or 0
    
    result = await db.execute(paginated_query)
    transactions = result.scalars().all()

    # Format response
    response_data = {
        "data": [TransactionResponse.model_validate(tx).model_dump(mode="json") for tx in transactions],
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit
    }

    # Store in Redis cache (expire in 60 seconds)
    await set_cache(cache_key, response_data, expire=60)
    
    return response_data

@router.get("/transactions/{tx_id}", response_model=TransactionResponse)
async def get_transaction(tx_id: int, db: AsyncSession = Depends(get_db)):
    cache_key = f"tx_detail:{tx_id}"
    cached_data = await get_cache(cache_key)
    if cached_data:
        return cached_data

    result = await db.execute(select(Transaction).where(Transaction.id == tx_id))
    transaction = result.scalar_one_or_none()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    response_data = TransactionResponse.model_validate(transaction).model_dump(mode="json")
    await set_cache(cache_key, response_data, expire=60)
    return response_data
