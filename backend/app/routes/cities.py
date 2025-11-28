from fastapi import APIRouter, HTTPException, Query
from typing import List
from ..services.geocoding import search_cities
from ..schemas import City

router = APIRouter()

@router.get("/", response_model=List[City])
async def get_cities(q: str = Query(..., description="City name to search for")):
    """Search cities by name with autocomplete"""
    if not q or len(q.strip()) < 2:
        raise HTTPException(status_code=400, detail="Query must be at least 2 characters long")
    
    cities = await search_cities(q.strip())
    return cities