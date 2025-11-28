from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

@router.get("/")
async def health_check():
    """Health check endpoint for docker-compose"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "canac-clima-backend"
    }