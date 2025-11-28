import time
from typing import Dict, Tuple, List, Any, Optional
from .schemas import City

# Cache TTL in seconds (5 minutes for weather, 1 hour for geocoding)
WEATHER_CACHE_TTL = 600
GEOCODING_CACHE_TTL = 3600

# In-memory cache storage
geocoding_cache: Dict[str, Tuple[List[City], float]] = {}
weather_cache: Dict[str, Tuple[Any, float]] = {}

def get_geocoding_cache(key: str) -> Optional[List[City]]:
    """Get cached geocoding results if not expired"""
    if key in geocoding_cache:
        cities, timestamp = geocoding_cache[key]
        if time.time() - timestamp < GEOCODING_CACHE_TTL:
            return cities
        else:
            # Remove expired entry
            del geocoding_cache[key]
    return None

def set_geocoding_cache(key: str, cities: List[City]) -> None:
    """Store geocoding results in cache"""
    geocoding_cache[key] = (cities, time.time())

def get_weather_cache(key: str) -> Optional[Any]:
    """Get cached weather data if not expired"""
    if key in weather_cache:
        data, timestamp = weather_cache[key]
        if time.time() - timestamp < WEATHER_CACHE_TTL:
            return data
        else:
            # Remove expired entry
            del weather_cache[key]
    return None

def set_weather_cache(key: str, data: Any) -> None:
    """Store weather data in cache"""
    weather_cache[key] = (data, time.time())
