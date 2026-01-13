import json
import os
import redis
from typing import Dict, Tuple, List, Any, Optional
from .schemas import City
from .logger import logger

# Cache TTL in seconds
WEATHER_CACHE_TTL = 600
GEOCODING_CACHE_TTL = 3600

# Redis Connection Setup
# We do NOT connect or ping here to avoid startup crashes in Serverless environments
# if the Redis URL is invalid or unreachable (e.g. localhost in Vercel).

redis_url = os.getenv("REDIS_URL", "")
redis_client = None

# Determine if we should attempt Redis connection
# In Vercel, if REDIS_URL is missing or is localhost, we skip directly to memory cache
should_use_redis = bool(redis_url and "localhost" not in redis_url)

if os.getenv("IS_DOCKER") or os.getenv("IS_LOCAL"):
    # Force attempt if explicitly in Docker/Local dev, even if localhost
    should_use_redis = bool(redis_url)

if should_use_redis:
    try:
        # Create client but don't ping immediately (lazy connection)
        # Socket timeout is critical to avoid hanging the serverless function
        redis_client = redis.from_url(
            redis_url, 
            decode_responses=True, 
            socket_timeout=2.0,
            socket_connect_timeout=2.0
        )
        logger.info(f"Redis client configured for {redis_url}")
    except Exception as e:
        logger.warning(f"Failed to configure Redis client: {e}. Using in-memory cache.")
        redis_client = None
else:
    logger.info("Redis disabled or invalid URL. Using in-memory cache.")

# In-memory fallback
_memory_cache = {}

def _get_from_redis(key: str) -> Optional[Any]:
    if not redis_client:
        return _memory_cache.get(key)
    try:
        val = redis_client.get(key)
        return json.loads(val) if val else None
    except Exception as e:
        # If Redis fails during operation, log and fallback to memory (optional, currently just returns None)
        logger.error(f"Redis get error: {e}")
        return None

def _set_in_redis(key: str, value: Any, ttl: int) -> None:
    if not redis_client:
        _memory_cache[key] = value
        return
    try:
        redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        logger.error(f"Redis set error: {e}")
        # Fallback to memory on write failure
        _memory_cache[key] = value

def get_geocoding_cache(key: str) -> Optional[List[City]]:
    """Get cached geocoding results"""
    data = _get_from_redis(f"geo:{key}")
    if data:
        # Reconstruct City objects
        return [City(**item) for item in data]
    return None

def set_geocoding_cache(key: str, cities: List[City]) -> None:
    """Store geocoding results in cache"""
    # Store as list of dicts
    data = [city.model_dump() for city in cities]
    _set_in_redis(f"geo:{key}", data, GEOCODING_CACHE_TTL)

def get_weather_cache(key: str) -> Optional[Any]:
    """Get cached weather data"""
    return _get_from_redis(f"weather:{key}")

def set_weather_cache(key: str, data: Any) -> None:
    """Store weather data in cache"""
    _set_in_redis(f"weather:{key}", data, WEATHER_CACHE_TTL)
